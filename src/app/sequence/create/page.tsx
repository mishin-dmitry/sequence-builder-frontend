'use client'

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {Asana, AsanaGroup, SequenceRequest} from 'types'

import {Resizable} from 're-resizable'
import {SearchFilter} from 'components/serch-filter'
import {getItem, removeItem, setItem} from 'lib/local-storage'

import {
  LOCAL_STORAGE_DESCRIPTION_KEY,
  LOCAL_STORAGE_DUPLICATED_SEQUENCE_KEY,
  LOCAL_STORAGE_EDITING_BLOCK,
  LOCAL_STORAGE_IS_PUBLIC_KEY,
  LOCAL_STORAGE_SEQUENCE_KEY,
  LOCAL_STORAGE_TITLE_KEY
} from 'lib/constants'

import {AsanasList} from 'components/asanas-list'
import {useSequence} from '../hooks'
import {PirsList} from 'components/pirs-list'
import {useAsanas} from 'context/asanas'
import {SequenceEditor} from 'components/sequence-editor'
import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
import {useRouter} from 'next/navigation'
import {useSettings} from 'context/settings'
import {Tabs} from 'antd'

import styles from './styles.module.css'
import debounce from 'lodash.debounce'

const RESET_SELECTED_ASANA_ID_TIMEOUT = 1000

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

const CreateSequencePage: React.FC = () => {
  const {asanas: allAsanas, asanaGroups, asanasMap} = useAsanas()
  const {isMobile} = useSettings()

  const [asanas, setAsanas] = useState(allAsanas)
  const [editingBlock, setEditingBlock] = useState('0')
  const [builderData, setBuilderData] = useState<Record<string, Asana[]>>({})
  const [selectedAsanaId, setSelectedAsanaId] = useState(-1)

  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isPublic, setIsPublic] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pirs'>('all')

  const {createSequence} = useSequence()
  const {isAuthorized} = useUser()

  const router = useRouter()
  const resetSelectedAsanaIdTimer = useRef<number>()
  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

  const onTabChange = useCallback((key: string) => {
    filterAsanaGroups.current = []
    searchAsanaString.current = ''

    setActiveTab(key as 'all' | 'pirs')
  }, [])

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

  useEffect(() => {
    const sequenceFromLS = getItem<Record<string, Asana[]>>(
      LOCAL_STORAGE_SEQUENCE_KEY
    )

    const duplicatedSequenceFromLS = getItem<Record<string, Asana[]>>(
      LOCAL_STORAGE_DUPLICATED_SEQUENCE_KEY
    )

    if (duplicatedSequenceFromLS) {
      setBuilderData(duplicatedSequenceFromLS)

      removeItem(LOCAL_STORAGE_DUPLICATED_SEQUENCE_KEY)

      return
    }

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
    (asana: Asana | [number, number]) => {
      const isArray = Array.isArray(asana)

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
          [editingBlock]: [
            ...(prevData[editingBlock] ?? []),
            ...(isArray
              ? [asanasMap[asana[0]], asanasMap[asana[1]]]
              : [asanasMap[asana.id]])
          ]
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

  const duplicateSequence = useCallback(() => {
    setItem(LOCAL_STORAGE_DUPLICATED_SEQUENCE_KEY, builderData)
  }, [builderData])

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

  const pirPairs = useMemo<[number, number][]>(() => {
    const result = [] as [number, number][]

    asanas.forEach(({id, pirs = []}) => {
      if (pirs.length) {
        pirs.forEach((pirId) => {
          result.push([id, pirId])
        })
      }
    })

    return result
  }, [asanas])

  const asanaActions = useMemo(
    () => (
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
              onFilterAsanas={onFilterAsana}
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
    ),
    [
      activeTab,
      asanaGroups,
      asanas,
      onAsanaClick,
      onFilterAsana,
      onSearchAsana,
      onTabChange,
      pirPairs,
      selectedAsanaId
    ]
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
            maxWidth={activeTab === 'all' ? '535px' : '200px'}
            minWidth={activeTab === 'all' ? '200px' : '250px'}>
            {asanaActions}
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
          onDuplicate={duplicateSequence}
          description={description}
          onChangeDescription={setDescription}
          isPublic={isPublic}
          scrollToAsana={scrollToAsana}
          onChangePublic={setIsPublic}
          asanasListNode={asanaActions}
        />
      </>
    </div>
  )
}

export default CreateSequencePage
