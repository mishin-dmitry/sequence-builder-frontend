import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {
  Asana,
  AsanaGroup,
  Sequence,
  SequenceRequest,
  AsanaBunch
} from 'types'

import {Resizable} from 're-resizable'
import {getItem, removeItem, setItem} from 'lib/local-storage'

import {
  LOCAL_STORAGE_DESCRIPTION_KEY,
  LOCAL_STORAGE_DUPLICATED_SEQUENCE_KEY,
  LOCAL_STORAGE_EDITING_BLOCK,
  LOCAL_STORAGE_IS_PUBLIC_KEY,
  LOCAL_STORAGE_SEQUENCE_KEY,
  LOCAL_STORAGE_TITLE_KEY
} from 'lib/constants'

import {useAsanas} from 'context/asanas'
import {SequenceEditor, Target} from 'components/sequence-editor'
import {Urls} from 'lib/urls'
import {useParams, useRouter} from 'next/navigation'
import {useSettings} from 'context/settings'
import {AsanaActions, TABS} from 'components/asana-actions'
import {useAsanasBunches} from 'context/asanas-bunches'
import {useSequence} from 'app/sequence/hooks'
import {useAsanaBunch} from 'app/asanas-bunch/hooks'

import styles from './styles.module.css'
import debounce from 'lodash.debounce'

const RESET_SELECTED_ASANA_ID_TIMEOUT = 1000

interface MainPageEditorProps {
  sequence?: Sequence

  asanasBunch?: AsanaBunch

  // Редактируем последовательность/связку
  isEditMode?: boolean

  // Работаем со связкой асан
  isBunchMode?: boolean
}

export const MainPageEditor: React.FC<MainPageEditorProps> = ({
  sequence,
  isEditMode,
  isBunchMode,
  asanasBunch
}) => {
  const {
    id,
    title: initialTitle = '',
    description: initialDescription = '',
    blocks = []
  } = sequence ?? {}

  const {asanas: bunchAsanas = [], title: bunchTitle = ''} = asanasBunch ?? {}

  const {asanas: allAsanas, asanaGroupsCategories, pirPairs} = useAsanas()
  const {isMobile} = useSettings()
  const {createSequence, deleteSequence, updateSequence} = useSequence()
  const {updateAsanasBunch, deleteAsanasBunch, createAsanasBunch} =
    useAsanaBunch()

  const {asanasBunches, updateAsanasBunches: contextUpdateAsanasBunches} =
    useAsanasBunches()

  const [asanas, setAsanas] = useState(allAsanas)
  const [editingBlock, setEditingBlock] = useState('block-1')
  const [selectedAsanaId, setSelectedAsanaId] = useState(-1)
  const [title, setTitle] = useState<string>(
    isBunchMode ? bunchTitle : initialTitle
  )
  const [description, setDescription] = useState<string>(initialDescription)

  const [builderData, setBuilderData] = useState<Record<string, Asana[]>>(
    (isBunchMode ? [bunchAsanas] : blocks).reduce(
      (acc: Record<string, Asana[]>, curValue, index) => {
        acc[`block-${index + 1}`] = curValue

        return acc
      },
      {}
    )
  )

  const router = useRouter()
  const params = useParams<{id: string}>()
  const resetSelectedAsanaIdTimer = useRef<number>()
  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

  const onTabChange = useCallback(() => {
    if (searchAsanaString.current) {
      searchAsanaString.current = ''
      setAsanas(allAsanas)
    }

    filterAsanaGroups.current = []
  }, [allAsanas])

  const clearLocalStorage = (): void => {
    removeItem(LOCAL_STORAGE_SEQUENCE_KEY)
    removeItem(LOCAL_STORAGE_EDITING_BLOCK)
    removeItem(LOCAL_STORAGE_TITLE_KEY)
    removeItem(LOCAL_STORAGE_DESCRIPTION_KEY)
    removeItem(LOCAL_STORAGE_IS_PUBLIC_KEY)
  }

  // Сохранить последовательность
  const onSave = useCallback(async () => {
    const data: SequenceRequest = {
      title,
      description,
      blocks: Object.values(builderData).map((block) =>
        block.map(({id, inRepeatingBlock = false, inDynamicBlock = false}) => ({
          asanaId: id,
          inRepeatingBlock,
          inDynamicBlock
        }))
      )
    }

    if (isBunchMode) {
      if (isEditMode && asanasBunch) {
        await updateAsanasBunch(asanasBunch.id as string, {
          title,
          asanas: builderData['block-1']
        })

        await contextUpdateAsanasBunches()
      }

      if (!isEditMode) {
        const {id} =
          (await createAsanasBunch({title, asanas: builderData['block-1']})) ??
          {}

        await contextUpdateAsanasBunches()

        if (id) {
          router.push(`${Urls.EDIT_ASANAS_BUNCH}/${id}`)
        }
      }

      return
    } else {
      if (isEditMode && sequence) {
        await updateSequence(params.id, data)
      }

      if (!isEditMode) {
        const {id} = (await createSequence(data)) || {}

        clearLocalStorage()

        if (id) {
          router.push(`${Urls.EDIT_SEQUENCE}/${id}`)
        }
      }
    }
  }, [
    asanasBunch,
    builderData,
    contextUpdateAsanasBunches,
    createAsanasBunch,
    createSequence,
    description,
    isBunchMode,
    isEditMode,
    params.id,
    router,
    sequence,
    title,
    updateAsanasBunch,
    updateSequence
  ])

  const onDelete = useCallback(async () => {
    if (isBunchMode && asanasBunch) {
      await deleteAsanasBunch(asanasBunch.id as string)
      await contextUpdateAsanasBunches()

      router.push(Urls.ASANAS_BUNCH)

      return
    }

    await deleteSequence(id as number)

    router.push(Urls.MY_SEQUENCES)
  }, [
    asanasBunch,
    contextUpdateAsanasBunches,
    deleteAsanasBunch,
    deleteSequence,
    id,
    isBunchMode,
    router
  ])

  const builderLength = Object.values(builderData).reduce(
    (acc, curValue) => (acc += curValue.length),
    0
  )

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
    if (isEditMode || isBunchMode) return

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

    if (sequenceFromLS) {
      setBuilderData(sequenceFromLS)
    }

    if (editingBlockFromLS) {
      setEditingBlock(editingBlockFromLS)
    }

    const titleFromLS = getItem<string>(LOCAL_STORAGE_TITLE_KEY)

    const descriptionFromLS = getItem<string>(LOCAL_STORAGE_DESCRIPTION_KEY)

    if (descriptionFromLS) {
      setDescription(descriptionFromLS)
    }

    if (titleFromLS) {
      setTitle(titleFromLS)
    }
  }, [isEditMode, isBunchMode])

  useEffect(() => {
    if (isEditMode || isBunchMode) return

    if (!title) {
      removeItem(LOCAL_STORAGE_TITLE_KEY)
    } else {
      setItem(LOCAL_STORAGE_TITLE_KEY, title)
    }
  }, [title, isEditMode, isBunchMode])

  useEffect(() => {
    if (isEditMode || isBunchMode) return

    if (!description) {
      removeItem(LOCAL_STORAGE_DESCRIPTION_KEY)
    } else {
      setItem(LOCAL_STORAGE_DESCRIPTION_KEY, description)
    }
  }, [description, isEditMode, isBunchMode])

  useEffect(() => {
    if (isEditMode || isBunchMode) return

    if (!builderLength) {
      removeItem(LOCAL_STORAGE_SEQUENCE_KEY)
    } else {
      setItem(LOCAL_STORAGE_SEQUENCE_KEY, builderData)
    }
  }, [builderData, builderLength, isEditMode, isBunchMode])

  useEffect(() => {
    if (isEditMode || isBunchMode) return

    if (!editingBlock) {
      removeItem(LOCAL_STORAGE_EDITING_BLOCK)
    } else {
      setItem(LOCAL_STORAGE_EDITING_BLOCK, editingBlock)
    }
  }, [editingBlock, isEditMode, isBunchMode])

  // Добавить асану в ряд последовательности
  const onAsanaClick = useCallback(
    (asana: Asana | Asana[]) => {
      const isArray = Array.isArray(asana)

      // Если слетел редактируемый блок
      if (!editingBlock) {
        const blockIds = Object.keys(builderData)

        // Если вообще нет блоков асан, то добавим редактируемый блок - 0
        // Иначе найдем последний
        setEditingBlock(
          !blockIds.length
            ? 'block-1'
            : `block-${blockIds[blockIds.length - 1]}`
        )
      }

      setBuilderData((prevData) => {
        return {
          ...prevData,
          [editingBlock]: [
            ...(prevData[editingBlock] ?? []),
            ...(isArray ? asana : [asana])
          ]
        }
      })
    },
    [builderData, editingBlock]
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
        const groupsByCategory = groups.reduce<Record<number, AsanaGroup[]>>(
          (acc, {categoryId, id, name}) => {
            if (!acc[categoryId]) {
              acc[categoryId] = []
            }

            acc[categoryId].push({id, name, categoryId})

            return acc
          },
          {}
        )

        filteredAsanas = Object.values(groupsByCategory).reduce(
          (acc, asanaGroupsByCategory) => {
            return acc.filter(({groups: asanaGroup}) => {
              return asanaGroup.some(({id}) =>
                asanaGroupsByCategory.some(({id: groupId}) => groupId === id)
              )
            })
          },
          source
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

  const tabs = useMemo(
    () =>
      TABS.filter(({forAuthorized}) => (isBunchMode ? !forAuthorized : true)),
    [isBunchMode]
  )

  const asanaActions = (
    <AsanaActions
      onTabChange={onTabChange}
      groupsCategories={asanaGroupsCategories}
      asanas={asanas}
      selectedAsanaId={selectedAsanaId}
      pirPairs={pirPairs}
      onSearchAsana={onSearchAsana}
      onFilterAsanaByGroups={onFilterAsanaByGroups}
      onAsanaClick={onAsanaClick}
      tabs={tabs}
      asanasBunches={!isBunchMode ? undefined : asanasBunches}
    />
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChange = useCallback(setBuilderData, [])

  const data = useMemo(() => builderData, [builderData])

  return (
    <div className={styles.root}>
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
        data={data}
        onChange={onChange}
        editingBlock={editingBlock}
        onChangeEditingBlock={setEditingBlock}
        title={title}
        onChangeTitle={setTitle}
        onDuplicate={isBunchMode ? undefined : duplicateSequence}
        description={description}
        onChangeDescription={setDescription}
        scrollToAsana={scrollToAsana}
        asanasListNode={asanaActions}
        onDelete={isEditMode ? onDelete : undefined}
        maxBlocksCount={isBunchMode ? 1 : undefined}
        target={isBunchMode ? Target.BUNCH : Target.SEQUENCE}
      />
    </div>
  )
}
