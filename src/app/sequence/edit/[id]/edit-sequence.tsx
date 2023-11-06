'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react'

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
import {useRouter, useSearchParams} from 'next/navigation'
import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
import {useAsanas} from 'context/asanas'
import {SequenceEditor} from 'components/sequence-editor'
import {Spinner} from 'components/spinner'
import {useSettings} from 'context/settings'

import styles from './styles.module.css'
import debounce from 'lodash.debounce'

interface EditSequenceProps {
  sequence: SequenceType
}

export const EditSequence: React.FC<EditSequenceProps> = ({
  sequence: {
    userId,
    id,
    title = '',
    description: initialDescription = '',
    isPublic: initialIsPublic,
    blocks
  }
}) => {
  const {asanas: allAsanas, asanaGroups, asanasMap} = useAsanas()
  const [documentTitle, setDocumentTitle] = useState<string>(title)
  const [description, setDescription] = useState<string>(initialDescription)
  const [asanas, setAsanas] = useState(allAsanas)
  const [editingBlock, setEditingBlock] = useState('0')
  const [isPublic, setIsPublic] = useState(initialIsPublic)

  const {isMobile} = useSettings()

  const [builderData, setBuilderData] = useState<Record<string, Asana[]>>(
    blocks.reduce((acc: Record<string, Asana[]>, curValue, index) => {
      acc[index] = curValue.asanas.map(
        ({id, options: {inRepeatingBlock, inDynamicBlock}}) => ({
          ...asanasMap[id],
          isAsanaInRepeatingBlock: inRepeatingBlock,
          isAsanaInDynamicBlock: inDynamicBlock
        })
      )

      return acc
    }, {})
  )

  useEffect(() => {
    setBuilderData(
      blocks.reduce((acc: Record<string, Asana[]>, curValue, index) => {
        acc[index] = curValue.asanas.map(
          ({id, options: {inRepeatingBlock, inDynamicBlock}}) => ({
            ...asanasMap[id],
            isAsanaInRepeatingBlock: inRepeatingBlock,
            isAsanaInDynamicBlock: inDynamicBlock
          })
        )

        return acc
      }, {})
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asanasMap])

  const router = useRouter()
  const searchParams = useSearchParams()

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

    await updateSequence(searchParams.get('id') as string, data)
  }, [
    documentTitle,
    description,
    isPublic,
    builderData,
    updateSequence,
    searchParams
  ])

  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

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
            title={documentTitle}
            onChangeTitle={setDocumentTitle}
            description={description}
            onChangeDescription={setDescription}
            isPublic={isPublic}
            onDelete={onDelete}
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
        </div>
      )}
    </>
  )
}
