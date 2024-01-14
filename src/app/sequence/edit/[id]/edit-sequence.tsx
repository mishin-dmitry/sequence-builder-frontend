'use client'

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {
  Asana,
  AsanaGroup,
  SequenceRequest,
  Sequence as SequenceType
} from 'types'

import {Resizable} from 're-resizable'
import {Meta} from 'components/meta'
import {SearchFilter} from 'components/serch-filter'
import {AsanasList} from 'components/asanas-list'
import {useSequence} from '../../hooks'
import {useParams, useRouter} from 'next/navigation'
import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
import {useAsanas} from 'context/asanas'
import {SequenceEditor} from 'components/sequence-editor'
import {Spinner} from 'components/spinner'
import {useSettings} from 'context/settings'
import {LOCAL_STORAGE_DUPLICATED_SEQUENCE_KEY} from 'lib/constants'
import {setItem} from 'lib/local-storage'
import {Tabs} from 'antd'

import styles from './styles.module.css'
import debounce from 'lodash.debounce'
import {PirsList} from 'components/pirs-list'

interface EditSequenceProps {
  sequence: SequenceType
}

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

export const EditSequence: React.FC<EditSequenceProps> = ({sequence}) => {
  const {
    userId,
    id,
    title = '',
    description: initialDescription = '',
    isPublic: initialIsPublic,
    blocks
  } = sequence

  const {asanas: allAsanas, asanaGroups, asanasMap} = useAsanas()
  const [documentTitle, setDocumentTitle] = useState<string>(title)
  const [description, setDescription] = useState<string>(initialDescription)
  const [asanas, setAsanas] = useState(allAsanas)
  const [editingBlock, setEditingBlock] = useState('0')
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [selectedAsanaId, setSelectedAsanaId] = useState(-1)
  const [activeTab, setActiveTab] = useState<'all' | 'pirs'>('all')

  const {isMobile} = useSettings()

  const resetSelectedAsanaIdTimer = useRef<number>()
  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

  const onTabChange = useCallback((key: string) => {
    filterAsanaGroups.current = []
    searchAsanaString.current = ''

    setActiveTab(key as 'all' | 'pirs')
  }, [])

  const [builderData, setBuilderData] = useState<Record<string, Asana[]>>(
    blocks.reduce((acc: Record<string, Asana[]>, curValue, index) => {
      acc[index] = curValue.map(({id, inRepeatingBlock, inDynamicBlock}) => ({
        ...asanasMap[id],
        isAsanaInRepeatingBlock: inRepeatingBlock,
        isAsanaInDynamicBlock: inDynamicBlock
      }))

      return acc
    }, {})
  )

  useEffect(() => {
    setBuilderData(
      blocks.reduce((acc: Record<string, Asana[]>, curValue, index) => {
        acc[index] = curValue.map(({id, inRepeatingBlock, inDynamicBlock}) => ({
          ...asanasMap[id],
          isAsanaInRepeatingBlock: inRepeatingBlock,
          isAsanaInDynamicBlock: inDynamicBlock
        }))

        return acc
      }, {})
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asanasMap])

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

  const params = useParams<{id: string}>()
  const router = useRouter()

  const {updateSequence, isFetching, deleteSequence} = useSequence()
  const {user, isAuthorized} = useUser()

  const onSave = useCallback(async () => {
    const data: SequenceRequest = {
      title: documentTitle,
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

    await updateSequence(params.id, data)
  }, [
    documentTitle,
    description,
    isPublic,
    builderData,
    updateSequence,
    params.id
  ])

  useEffect(() => {
    setAsanas(allAsanas)
  }, [allAsanas])

  useEffect(() => {
    if (!!user && user.id !== userId) {
      router.replace(Urls.CREATE_SEQUENCE)
    }
  }, [router, user, userId])

  useEffect(() => {
    if (!isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, isFetching, isFetching, router])

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
            asanaGroups.some(({id: groupId}) => groupId === id)
          )
        )
      }

      setAsanas(filteredAsanas)
    },
    [allAsanas, asanas, onSearchAsana]
  )

  const onDelete = useCallback(async () => {
    await deleteSequence(id as number)

    router.push(Urls.MY_SEQUENCES)
  }, [deleteSequence, id, router])

  const shouldShowSpinner = false

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
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      {shouldShowSpinner ? (
        <Spinner />
      ) : (
        <div className={styles.root}>
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
            title={documentTitle}
            onChangeTitle={setDocumentTitle}
            description={description}
            onChangeDescription={setDescription}
            isPublic={isPublic}
            onDelete={onDelete}
            onDuplicate={duplicateSequence}
            onChangePublic={setIsPublic}
            scrollToAsana={scrollToAsana}
            asanasListNode={asanaActions}
          />
        </div>
      )}
    </>
  )
}
