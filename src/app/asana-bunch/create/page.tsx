'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react'

import {Resizable} from 're-resizable'
import {AsanaActions} from 'components/asana-actions'
import {useAsanas} from 'context/asanas'
import {useSettings} from 'context/settings'
import {useUser} from 'context/user'
import {useRouter} from 'next/navigation'
import {Urls} from 'lib/urls'
import {SequenceEditor} from 'components/sequence-editor'

import type {Asana, AsanaGroup} from 'types'
import debounce from 'lodash.debounce'

import styles from '../styles.module.css'

const RESET_SELECTED_ASANA_ID_TIMEOUT = 1000

const CreateAsanaBunchPage: React.FC = () => {
  const {asanas: allAsanas, asanaGroups, asanasMap} = useAsanas()
  const {isMobile} = useSettings()

  const [asanas, setAsanas] = useState(allAsanas)
  const [asanasBunch, setAsanasBunch] = useState<Asana[]>([])
  const [selectedAsanaId, setSelectedAsanaId] = useState(-1)

  const [title, setTitle] = useState<string>('')

  const {isAuthorized} = useUser()

  const router = useRouter()
  const resetSelectedAsanaIdTimer = useRef<number>()
  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

  // Сохранить последовательность
  const onSave = useCallback(async () => {
    // const data: SequenceRequest = {
    //   title,
    //   blocks: Object.values(builderData).map((block) =>
    //     block.map(
    //       ({
    //         id,
    //         isAsanaInRepeatingBlock = false,
    //         isAsanaInDynamicBlock = false
    //       }) => ({
    //         asanaId: id,
    //         inRepeatingBlock: isAsanaInRepeatingBlock,
    //         inDynamicBlock: isAsanaInDynamicBlock
    //       })
    //     )
    //   )
    // }
    // const {id} = (await createSequence(data)) || {}
    // if (id) {
    //   router.push(`${Urls.EDIT_SEQUENCE}/${id}`)
    // }
  }, [])

  useEffect(() => {
    setAsanas(allAsanas)
  }, [allAsanas])

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
    (asana: Asana | [number, number]) =>
      setAsanasBunch((prevBunch = []) => [...prevBunch, asana as Asana]),
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

  const asanaActions = (
    <AsanaActions
      asanaGroups={asanaGroups}
      asanas={asanas}
      selectedAsanaId={selectedAsanaId}
      onSearchAsana={onSearchAsana}
      onFilterAsanaByGroups={onFilterAsanaByGroups}
      onAsanaClick={onAsanaClick}
      tabs={[{key: 'all', label: 'Все асаны'}]}
    />
  )

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
          data={asanasBunch}
          onChange={onChangeAsanasBunch}
          editingBlock="0"
          title={title}
          onChangeTitle={setTitle}
          scrollToAsana={scrollToAsana}
          asanasListNode={asanaActions}
          target="bunch"
        />
      </>
    </div>
  )
}

export default CreateAsanaBunchPage
