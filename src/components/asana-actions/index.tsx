import React, {useEffect, useMemo, useState} from 'react'

import {Tabs as TabsComponent} from 'antd'
import {PirsList} from 'components/pirs-list'
import {SearchFilter} from 'components/serch-filter'
import {AsanasList} from 'components/asanas-list'
import {useUser} from 'context/user'
import {AsanasBunchesList} from 'components/asanas-bunches-list'

import type {Asana, AsanaBunch, AsanaGroup, AsanaGroupCategory} from 'types'

import styles from './styles.module.css'

export enum Tabs {
  ALL = 'all',
  PIRS = 'pirs',
  BUNCHES = 'bunches'
}

interface Tab {
  key: Tabs
  label: string
  forAuthorized?: boolean
}

interface AsanaActionsProps {
  pirPairs?: [number, number][]
  groupsCategories: AsanaGroupCategory[]
  asanas: Asana[]
  asanasBunches?: AsanaBunch[]
  selectedAsanaId: number
  tabs?: Tab[]
  onTabChange?: () => void
  onSearchAsana: (value: string) => void
  onAsanaClick: (asana: Asana | Asana[]) => void
  onFilterAsanaByGroups: (groups: AsanaGroup[]) => void
}

export const TABS: Tab[] = [
  {
    key: Tabs.ALL,
    label: 'Все асаны'
  },
  // {
  //   key: Tabs.PIRS,
  //   label: 'Связки ПИРов'
  // },
  {
    key: Tabs.BUNCHES,
    label: 'Связки асан',
    forAuthorized: true
  }
]

export const AsanaActions: React.FC<AsanaActionsProps> = ({
  onTabChange: onTabChangeProp,
  onAsanaClick,
  pirPairs = [],
  onSearchAsana,
  groupsCategories,
  onFilterAsanaByGroups,
  asanas,
  selectedAsanaId,
  tabs: propTabs = TABS,
  asanasBunches = []
}) => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.ALL)

  const {isAuthorized} = useUser()

  useEffect(() => {
    if (!isAuthorized && activeTab === Tabs.BUNCHES) {
      setActiveTab(Tabs.ALL)
    }
  }, [activeTab, isAuthorized])

  const onTabChange = (key: string): void => {
    onTabChangeProp?.()

    setActiveTab(key as Tabs)
  }

  const tabs = useMemo(
    () =>
      propTabs.filter(
        ({forAuthorized}) => forAuthorized === undefined || isAuthorized
      ),
    [isAuthorized, propTabs]
  )

  return (
    <div className={styles.listWrapper}>
      <TabsComponent
        className={styles.tabs}
        onChange={onTabChange}
        items={tabs}
      />
      {activeTab === Tabs.PIRS && (
        <PirsList onClick={onAsanaClick} pairs={pirPairs} />
      )}
      {activeTab === Tabs.ALL && (
        <>
          <SearchFilter
            onSearchAsana={onSearchAsana}
            groupsCategories={groupsCategories}
            onFilterAsanaByGroups={onFilterAsanaByGroups}
            searchItems={asanas}
          />
          <AsanasList
            asanas={asanas}
            onAsanaClick={onAsanaClick}
            size="small"
            selectedId={selectedAsanaId}
          />
        </>
      )}
      {activeTab === Tabs.BUNCHES && (
        <AsanasBunchesList
          asanasBunches={asanasBunches}
          onAsanasBunchClick={onAsanaClick}
        />
      )}
    </div>
  )
}
