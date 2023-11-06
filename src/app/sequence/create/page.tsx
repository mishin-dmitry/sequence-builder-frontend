'use client'

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {Asana, AsanaGroup, SequenceRequest} from 'types'
import type {PageProps} from 'types/page-props'

import {Resizable} from 're-resizable'
import {SearchFilter} from 'components/serch-filter'
import {getItem, removeItem, setItem} from 'lib/local-storage'

import {
  LOCAL_STORAGE_DESCRIPTION_KEY,
  LOCAL_STORAGE_EDITING_BLOCK,
  LOCAL_STORAGE_IS_PUBLIC_KEY,
  LOCAL_STORAGE_SEQUENCE_KEY,
  LOCAL_STORAGE_TITLE_KEY
} from 'lib/constants'

import {AsanasList} from 'components/asanas-list'
import {useSequence} from '../hooks'
import {useAsanas} from 'context/asanas'
import {SequenceEditor} from 'components/sequence-editor'
import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
import {useRouter} from 'next/navigation'
import {useSettings} from 'context/settings'

import styles from './styles.module.css'
import debounce from 'lodash.debounce'

const CreateSequencePage: React.FC<PageProps> = () => {
  const {asanas: allAsanas, asanaGroups, asanasMap} = useAsanas()
  const {isMobile} = useSettings()

  const [asanas, setAsanas] = useState(allAsanas)
  const [editingBlock, setEditingBlock] = useState('0')
  const [builderData, setBuilderData] = useState<Record<string, Asana[]>>({})

  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isPublic, setIsPublic] = useState(true)

  const {createSequence} = useSequence()
  const {isAuthorized} = useUser()

  const router = useRouter()

  const clearLocalStorage = useCallback(() => {
    removeItem(LOCAL_STORAGE_SEQUENCE_KEY)
    removeItem(LOCAL_STORAGE_EDITING_BLOCK)
    removeItem(LOCAL_STORAGE_TITLE_KEY)
    removeItem(LOCAL_STORAGE_DESCRIPTION_KEY)
    removeItem(LOCAL_STORAGE_IS_PUBLIC_KEY)
  }, [])

  // Сохранить последовательность
  const onSave = useCallback(async () => {
    const data: SequenceRequest = {
      title,
      description,
      isPublic,
      blocks: Object.values(builderData).map((block) =>
        block.map(
          ({
            id,
            isAsanaInRepeatingBlock = false,
            isAsanaInDynamicBlock = false
          }) => ({
            asanaId: id,
            inRepeatingBlock: isAsanaInRepeatingBlock,
            inDynamicBlock: isAsanaInDynamicBlock
          })
        )
      )
    }

    const {id} = (await createSequence(data)) || {}

    clearLocalStorage()

    if (id) {
      router.push(`${Urls.EDIT_SEQUENCE}/${id}`)
    }
  }, [
    builderData,
    clearLocalStorage,
    createSequence,
    description,
    isPublic,
    router,
    title
  ])

  const builderLength = useMemo(() => {
    return Object.values(builderData).reduce(
      (acc, curValue) => (acc += curValue.length),
      0
    )
  }, [builderData])

  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

  useEffect(() => {
    setAsanas(allAsanas)
  }, [allAsanas])

  useEffect(() => {
    const sequenceFromLS = getItem<Record<string, Asana[]>>(
      LOCAL_STORAGE_SEQUENCE_KEY
    )

    const editingBlockFromLS = getItem<string>(LOCAL_STORAGE_EDITING_BLOCK)
    const titleFromLS = getItem<string>(LOCAL_STORAGE_TITLE_KEY)

    if (sequenceFromLS) {
      setBuilderData(sequenceFromLS)
    }

    if (editingBlockFromLS) {
      setEditingBlock(editingBlockFromLS)
    }

    if (titleFromLS) {
      setTitle(titleFromLS)
    }

    if (isAuthorized) {
      const isPublicFromLS = getItem<boolean>(LOCAL_STORAGE_IS_PUBLIC_KEY)

      const descriptionFromLS = getItem<string>(LOCAL_STORAGE_DESCRIPTION_KEY)

      if (descriptionFromLS) {
        setDescription(descriptionFromLS)
      }

      if (isPublicFromLS) {
        setIsPublic(isPublicFromLS)
      }
    }
  }, [isAuthorized])

  useEffect(() => {
    if (!title) {
      removeItem(LOCAL_STORAGE_TITLE_KEY)
    } else {
      setItem(LOCAL_STORAGE_TITLE_KEY, title)
    }
  }, [title])

  useEffect(() => {
    if (!description) {
      removeItem(LOCAL_STORAGE_DESCRIPTION_KEY)
    } else {
      setItem(LOCAL_STORAGE_DESCRIPTION_KEY, description)
    }
  }, [description])

  useEffect(() => {
    setItem(LOCAL_STORAGE_IS_PUBLIC_KEY, isPublic)
  }, [isPublic])

  useEffect(() => {
    if (!builderLength) {
      removeItem(LOCAL_STORAGE_SEQUENCE_KEY)
    } else {
      setItem(LOCAL_STORAGE_SEQUENCE_KEY, builderData)
    }
  }, [builderData, builderLength])

  useEffect(() => {
    if (!editingBlock) {
      removeItem(LOCAL_STORAGE_EDITING_BLOCK)
    } else {
      setItem(LOCAL_STORAGE_EDITING_BLOCK, editingBlock)
    }
  }, [editingBlock])

  // Добавить асану в ряд последовательности
  const onAsanaClick = useCallback(
    ({id}: Asana) => {
      // Если слетел редактируемый блок
      if (!editingBlock) {
        const blockIds = Object.keys(builderData)

        // Если вообще нет блоков асан, то добавим редактируемый блок - 0
        // Иначе найдем последний
        setEditingBlock(!blockIds.length ? '0' : blockIds[blockIds.length - 1])
      }

      setBuilderData((prevData) => {
        return {
          ...prevData,
          [editingBlock]: [...(prevData[editingBlock] ?? []), asanasMap[id]]
        }
      })
    },
    [asanasMap, builderData, editingBlock]
  )

  const onSearchAsana = useCallback(
    debounce((value: string) => {
      searchAsanaString.current = value ?? ''

      if (!value && filterAsanaGroups.current.length) {
        onFilterAsana(filterAsanaGroups.current)

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
    [allAsanas, asanas]
  )

  const onFilterAsana = useCallback(
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
            minWidth="170px">
            <div className={styles.listWrapper}>
              <SearchFilter
                onSearchAsana={onSearchAsana}
                filterItems={asanaGroups}
                onFilterAsanas={onFilterAsana}
                searchItems={asanas}
              />
              <AsanasList
                asanas={asanas}
                onAsanaClick={onAsanaClick}
                size="small"
              />
            </div>
          </Resizable>
        )}
        <SequenceEditor
          onSave={onSave}
          data={builderData}
          onChange={setBuilderData}
          editingBlock={editingBlock}
          onChangeEditingBlock={setEditingBlock}
          title={title}
          onChangeTitle={setTitle}
          description={description}
          onChangeDescription={setDescription}
          isPublic={isPublic}
          onChangePublic={setIsPublic}
          asanasListNode={
            <div className={styles.listWrapper}>
              <SearchFilter
                onSearchAsana={onSearchAsana}
                filterItems={asanaGroups}
                onFilterAsanas={onFilterAsana}
                searchItems={asanas}
              />
              <AsanasList
                asanas={asanas}
                onAsanaClick={onAsanaClick}
                size="small"
              />
            </div>
          }
        />
      </>
    </div>
  )
}

export default CreateSequencePage
