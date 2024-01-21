import React, {useCallback, useState} from 'react'

import {Tabs} from 'antd'
import {PirsList} from 'components/pirs-list'
import {SearchFilter} from 'components/serch-filter'
import {AsanasList} from 'components/asanas-list'

import type {Asana, AsanaGroup} from 'types'

import styles from './styles.module.css'

interface AsanaActionsProps {
  pirPairs: [number, number][]
  asanaGroups: AsanaGroup[]
  asanas: Asana[]
  selectedAsanaId: number
  onTabChange: () => void
  onSearchAsana: (value: string) => void
  onAsanaClick: (asana: Asana | [number, number]) => void
  onFilterAsanaByGroups: (groups: AsanaGroup[]) => void
}

const TABS = [
  {
    key: 'all',
    label: 'Все асаны'
  },
  {
    key: 'pirs',
    label: 'Связки ПИРов'
  }
]

export const AsanaActions: React.FC<AsanaActionsProps> = ({
  onTabChange: onTabChangeProp,
  onAsanaClick,
  pirPairs,
  onSearchAsana,
  asanaGroups,
  onFilterAsanaByGroups,
  asanas,
  selectedAsanaId
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pirs'>('all')

  const onTabChange = useCallback(
    (key: string) => {
      onTabChangeProp()

      setActiveTab(key as 'all' | 'pirs')
    },
    [onTabChangeProp]
  )

  return (
    <div className={styles.listWrapper}>
      <Tabs className={styles.tabs} onChange={onTabChange} items={TABS} />
      {activeTab === 'pirs' && (
        <PirsList onClick={onAsanaClick} pairs={pirPairs} />
      )}
      {activeTab === 'all' && (
        <>
          <SearchFilter
            onSearchAsana={onSearchAsana}
            filterItems={asanaGroups}
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
    </div>
  )
}
