'use client'

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {Resizable} from 're-resizable'
import {AsanaActions, TABS} from 'components/asana-actions'
import {useAsanas} from 'context/asanas'
import {useSettings} from 'context/settings'
import {useUser} from 'context/user'
import {useRouter} from 'next/navigation'
import {SequenceEditor} from 'components/sequence-editor'
import {useAsanaBunch} from '../../hooks'
import {useAsanasBunches} from 'context/asanas-bunches'
import {Urls} from 'lib/urls'

import type {Asana, AsanaBunch, AsanaGroup} from 'types'
import debounce from 'lodash.debounce'

import styles from '../../styles.module.css'

const RESET_SELECTED_ASANA_ID_TIMEOUT = 1000

interface EditAsanasBunchPageProps {
  asanasBunch: AsanaBunch
}

export const EditAsanasBunch: React.FC<EditAsanasBunchPageProps> = ({
  asanasBunch: propAsanasBunch
}) => {
  const {asanas: allAsanas, asanaGroups, pirPairs} = useAsanas()

  const [asanas, setAsanas] = useState(allAsanas)

  const [asanasBunch, setAsanasBunch] = useState<Asana[]>(
    propAsanasBunch.asanas
  )

  const [selectedAsanaId, setSelectedAsanaId] = useState(-1)

  const [title, setTitle] = useState<string>(propAsanasBunch.title)

  const {updateAsanasBunch} = useAsanaBunch()
  const {updateAsanasBunches: contextUpdateAsanasBunches} = useAsanasBunches()
  const {isMobile} = useSettings()
  const {isAuthorized} = useUser()

  const router = useRouter()
  const resetSelectedAsanaIdTimer = useRef<number>()
  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

  // Сохранить последовательность
  const onSave = useCallback(async () => {
    await updateAsanasBunch(propAsanasBunch.id as string, {
      title,
      asanas: asanasBunch
    })

    await contextUpdateAsanasBunches()

    router.push(Urls.ASANAS_BUNCH)
  }, [
    updateAsanasBunch,
    propAsanasBunch.id,
    title,
    asanasBunch,
    contextUpdateAsanasBunches,
    router
  ])

  useEffect(() => {
    setAsanas(allAsanas)
  }, [allAsanas])

  useEffect(() => {
    if (!isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, router])

  useEffect(() => {
    if (selectedAsanaId) {
      resetSelectedAsanaIdTimer.current = window.setTimeout(() => {
        setSelectedAsanaId(-1)
      }, RESET_SELECTED_ASANA_ID_TIMEOUT)
    }

    return () => {
      if (resetSelectedAsanaIdTimer.current) {
        window.clearTimeout(resetSelectedAsanaIdTimer.current)
      }
    }
  }, [selectedAsanaId])

  // Добавить асану в ряд последовательности
  const onAsanaClick = useCallback(
    (asana: Asana | Asana[]) =>
      setAsanasBunch((prevBunch = []) => [
        ...prevBunch,
        ...(Array.isArray(asana) ? asana : [asana])
      ]),
    []
  )

  const onSearchAsana = useCallback(
    debounce((value: string) => {
      searchAsanaString.current = value ?? ''

      if (!value && filterAsanaGroups.current.length) {
        onFilterAsanaByGroups(filterAsanaGroups.current)

        return
      }

      const source = filterAsanaGroups.current.length ? asanas : allAsanas

      const filteredAsanas = value
        ? source.filter(({name, searchKeys}) => {
            const parsedSearchKeys = searchKeys?.split(',') ?? []

            return (
              name.toLowerCase().includes(value.toLowerCase()) ||
              parsedSearchKeys.some((key: string) =>
                key.toLowerCase().includes(value.toLowerCase())
              )
            )
          })
        : source

      setAsanas(filteredAsanas)
    }, 200),
    []
  )

  const onFilterAsanaByGroups = useCallback(
    (groups: AsanaGroup[] = []) => {
      let filteredAsanas

      filterAsanaGroups.current = groups

      if (!groups.length && searchAsanaString.current) {
        onSearchAsana(searchAsanaString.current)

        return
      }

      const source = searchAsanaString.current ? asanas : allAsanas

      // фильтр пуст
      if (!groups.length) {
        filteredAsanas = source
      } else {
        filteredAsanas = source.filter(({groups: asanaGroups}) =>
          groups.some(({id}) =>
            asanaGroups.some(({id: groupdId}) => groupdId === id)
          )
        )
      }

      setAsanas(filteredAsanas)
    },
    [allAsanas, asanas, onSearchAsana]
  )

  const scrollToAsana = useCallback(
    (id: number) => {
      if (resetSelectedAsanaIdTimer.current) {
        window.clearTimeout(resetSelectedAsanaIdTimer.current)
      }

      if (id !== selectedAsanaId) {
        if (resetSelectedAsanaIdTimer.current) {
          window.clearTimeout(resetSelectedAsanaIdTimer.current)
        }

        setSelectedAsanaId(id)
      }
    },
    [selectedAsanaId]
  )

  const onChangeAsanasBunch = useCallback((data: Record<string, Asana[]>) => {
    setAsanasBunch(data['0'])
  }, [])

  const tabs = useMemo(
    () => TABS.filter(({forAuthorized}) => !forAuthorized),
    []
  )

  const asanaActions = (
    <AsanaActions
      asanaGroups={asanaGroups}
      asanas={asanas}
      selectedAsanaId={selectedAsanaId}
      onSearchAsana={onSearchAsana}
      onFilterAsanaByGroups={onFilterAsanaByGroups}
      onAsanaClick={onAsanaClick}
      tabs={tabs}
      pirPairs={pirPairs}
    />
  )

  const sequenceData = useMemo(() => ({0: asanasBunch}), [asanasBunch])

  return (
    <div className={styles.root}>
      <>
        {!isMobile && (
          <Resizable
            className={styles.resizable}
            defaultSize={{
              width: '352px',
              height: '100%'
            }}
            maxWidth="535px"
            minWidth="200px">
            {asanaActions}
          </Resizable>
        )}
        <SequenceEditor
          onSave={onSave}
          data={sequenceData}
          onChange={onChangeAsanasBunch}
          editingBlock="0"
          title={title}
          onChangeTitle={setTitle}
          scrollToAsana={scrollToAsana}
          asanasListNode={asanaActions}
          target="bunch"
          maxBlocksCount={1}
        />
      </>
    </div>
  )
}
