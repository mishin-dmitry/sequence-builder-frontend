import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import type {Asana, AsanaGroup, SequenceRequest} from 'types'
import type {PageProps} from 'types/page-props'
import type {GetServerSideProps} from 'next/types'

import {Resizable} from 're-resizable'
import {Meta} from 'components/meta'
import {SearchFilter} from 'components/serch-filter'
import {getItem, removeItem, setItem} from 'lib/local-storage'

import {
  LOCAL_STORAGE_EDITING_BLOCK,
  LOCAL_STORAGE_SEQUENCE_KEY,
  LOCAL_STORAGE_TITLE_KEY
} from 'lib/constants'

import {AsanasList} from 'components/asanas-list'
import {useSequence} from '../hooks'
import {useAsanas} from 'context/asanas'
import {SequenceEditor} from 'components/sequence-editor'

import styles from './styles.module.css'
import debounce from 'lodash.debounce'
import clsx from 'clsx'

const CreateSequencePage: React.FC<PageProps> = ({isMobile}) => {
  const {asanas: allAsanas, asanaGroups, asanasMap, isFetching} = useAsanas()
  const [asanas, setAsanas] = useState(allAsanas)
  const [editingBlock, setEditingBlock] = useState('0')
  const [builderData, setBuilderData] = useState<Record<string, Asana[]>>({})
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isPublic, setIsPublic] = useState(false)

  const {createSequence} = useSequence()

  // Сохранить последовательность
  const onSave = useCallback(async () => {
    const data: SequenceRequest = {
      title,
      description,
      isPublic,
      blocks: Object.values(builderData).map((block) =>
        block.map(({id, isAsanaInRepeatingBlock = false}) => ({
          asanaId: id,
          inRepeatingBlock: isAsanaInRepeatingBlock
        }))
      )
    }

    await createSequence(data)
  }, [builderData, createSequence, description, isPublic, title])

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
    const documentTitleFromLS = getItem<string>(LOCAL_STORAGE_TITLE_KEY)

    if (sequenceFromLS) {
      setBuilderData(sequenceFromLS)
    }

    if (editingBlockFromLS) {
      setEditingBlock(editingBlockFromLS)
    }

    if (documentTitleFromLS) {
      setTitle(documentTitleFromLS)
    }
  }, [])

  useEffect(() => {
    if (!title) {
      removeItem(LOCAL_STORAGE_TITLE_KEY)
    } else {
      setItem(LOCAL_STORAGE_TITLE_KEY, title)
    }
  }, [title])

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
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <div className={clsx(styles.root, isMobile && styles.mobile)}>
        {!isMobile && (
          <Resizable
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: '1px solid #ddd'
            }}
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
                isMobile={isMobile}
                asanas={asanas}
                onAsanaClick={onAsanaClick}
                size="small"
                isLoading={isFetching}
              />
            </div>
          </Resizable>
        )}
        <SequenceEditor
          isMobile={isMobile}
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
                isMobile={isMobile}
                asanas={asanas}
                onAsanaClick={onAsanaClick}
                size="small"
              />
            </div>
          }
        />
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent']

  const isMobile = Boolean(
    UA?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  )

  return {props: {isMobile}}
}

export default CreateSequencePage
