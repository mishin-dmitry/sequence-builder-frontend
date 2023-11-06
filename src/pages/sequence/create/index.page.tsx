import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import styles from './styles.module.css'
import {AsanasList} from 'components/asanas-list'
import PdfViewer from 'components/pdf-viewer'
import {Asana, AsanaGroup} from 'types'
import {Button, Modal} from 'antd'
import {PDFDocument} from 'components/pdf-viewer/document'

import {saveAs} from 'file-saver'
import {pdf} from '@react-pdf/renderer'
import {Sequence} from 'components/sequence'
import {arrayMove} from 'lib/array-move'

import type {GetServerSideProps} from 'next/types'
import {Resizable} from 're-resizable'
import {Input} from 'components/input'
import {getAsanaGroupsList, getAsanasList} from 'api/actions'
import {Meta} from 'components/meta'
import type {PageProps} from 'types/page-props'
import {reachGoal} from 'lib/metrics'
import {SearchFilter} from 'components/serch-filter'
import {getItem, removeItem, setItem} from 'lib/local-storage'
import {
  LOCAL_STORAGE_EDITING_BLOCK,
  LOCAL_STORAGE_SEQUENCE_KEY,
  LOCAL_STORAGE_TIME_SETTINGS,
  LOCAL_STORAGE_TITLE_KEY
} from 'lib/constants'

import debounce from 'lodash.debounce'
import {SettingOutlined} from '@ant-design/icons'
import {TimeSettingsFormInputs, SequenceTimeForm} from './sequence-time-form'
import dayjs from 'dayjs'
import type {DragStartEvent, DragEndEvent} from '@dnd-kit/core'
import {useTheme} from 'context/theme'

const DEFAULT_TIME_SETTINGS = {
  pranayamaTime: dayjs().minute(10).second(0),
  warmUpTime: dayjs().minute(5).second(0),
  namaskarTime: dayjs().minute(10).second(0),
  asanaTime: dayjs().minute(0).second(30),
  shavasanaTime: dayjs().minute(15).second(0)
}

const CreateSequencePage: React.FC<PageProps> = ({
  isMobile,
  asanas: allAsanas = [],
  asanaGroups = [],
  asanaMap = {}
}) => {
  const [documentTitle, setDocumentTitle] = useState<string>('')
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)
  const [isAsanasModalVisible, setIsAsanasModalVisible] = useState(false)
  const [asanas, setAsanas] = useState(allAsanas)
  const [isTimeSettingsVisible, setIsTimeSettingsVisible] = useState(false)
  const [editingBlock, setEditingBlock] = useState('0')
  const [builderData, setBuilderData] = useState<Record<string, Asana[]>>({})

  const {isDarkTheme} = useTheme()

  const builderLength = useMemo(() => {
    return Object.values(builderData).reduce(
      (acc, curValue) => (acc += curValue.length),
      0
    )
  }, [builderData])

  const [timeSettings, setTimeSettings] = useState<TimeSettingsFormInputs>(
    DEFAULT_TIME_SETTINGS
  )

  const [sequenceDuration, setSequenceDuration] = useState<{
    hours?: number
    minutes?: number
  }>({})

  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

  useEffect(() => {
    setAsanas(allAsanas)
  }, [allAsanas])

  useEffect(() => {
    const sequenceFromLS = getItem<Record<string, Asana[]>>(
      LOCAL_STORAGE_SEQUENCE_KEY
    )

    const documentTitleFromLS = getItem<string>(LOCAL_STORAGE_TITLE_KEY)
    const editingBlockFromLS = getItem<string>(LOCAL_STORAGE_EDITING_BLOCK)

    const timeSettingsFromLS = getItem<
      Record<keyof TimeSettingsFormInputs, string>
    >(LOCAL_STORAGE_TIME_SETTINGS)

    if (editingBlockFromLS) {
      setEditingBlock(editingBlockFromLS)
    }

    if (documentTitleFromLS) {
      setDocumentTitle(documentTitleFromLS)
    }

    if (sequenceFromLS) {
      setBuilderData(sequenceFromLS)
    }

    setTimeSettings(
      timeSettingsFromLS
        ? {
            asanaTime: dayjs(timeSettingsFromLS.asanaTime),
            namaskarTime: dayjs(timeSettingsFromLS.namaskarTime),
            pranayamaTime: dayjs(timeSettingsFromLS.pranayamaTime),
            shavasanaTime: dayjs(timeSettingsFromLS.shavasanaTime),
            warmUpTime: dayjs(timeSettingsFromLS.warmUpTime)
          }
        : DEFAULT_TIME_SETTINGS
    )
  }, [])

  useEffect(() => {
    const time = Object.entries(timeSettings).reduce(
      (acc, curValue) => {
        const [key, time] = curValue

        if (!time) return acc

        const seconds = time.second()
        const minutes = time.minute()

        if (key === 'asanaTime') {
          Object.values(builderData).forEach((asanasBlock) => {
            asanasBlock.forEach(({isAsanaInRepeatingBlock}) => {
              acc.seconds += isAsanaInRepeatingBlock ? seconds * 2 : seconds
              acc.minutes += isAsanaInRepeatingBlock ? minutes * 2 : minutes
            })
          })
        } else {
          acc.seconds += seconds
          acc.minutes += minutes
        }

        return acc
      },
      {minutes: 0, seconds: 0}
    )

    const hours = Math.floor(time.minutes / 60)
    let minutes = time.minutes % 60

    if (time.seconds > 60) {
      minutes += Math.floor(time.seconds / 60)
    }

    setSequenceDuration({hours, minutes})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeSettings, builderData])

  useEffect(() => {
    if (!documentTitle) {
      removeItem(LOCAL_STORAGE_TITLE_KEY)
    } else {
      setItem(LOCAL_STORAGE_TITLE_KEY, documentTitle)
    }
  }, [documentTitle])

  useEffect(() => {
    if (!editingBlock) {
      removeItem(LOCAL_STORAGE_EDITING_BLOCK)
    } else {
      setItem(LOCAL_STORAGE_EDITING_BLOCK, editingBlock)
    }
  }, [editingBlock])

  useEffect(() => {
    if (!builderLength) {
      removeItem(LOCAL_STORAGE_SEQUENCE_KEY)
    } else {
      setItem(LOCAL_STORAGE_SEQUENCE_KEY, builderData)
    }
  }, [builderData, builderLength])

  // Удалить асану в редактируемой последовательности
  const deleteAsanaById = useCallback(
    (asanaIndex: number, blockId: string): void => {
      setBuilderData((prevData) => {
        return {
          ...prevData,
          [blockId]: (prevData[blockId] ?? []).filter(
            (_, index) => index !== asanaIndex
          )
        }
      })
    },
    []
  )

  // Очистить последовательность
  const clearSequence = useCallback(() => {
    setBuilderData({})
    setDocumentTitle('')
    setEditingBlock('0')

    reachGoal('clear_sequence')
  }, [])

  // Скрыть превью pdf файла
  const hidePreview = useCallback(() => setIsPdfModalVisible(false), [])

  // Показать превью pdf файла
  const showPreview = useCallback(() => {
    setIsPdfModalVisible(true)

    reachGoal('show_preview')
  }, [])

  // Скрыть превью pdf файла
  const hideAsanasModal = useCallback(() => setIsAsanasModalVisible(false), [])

  // Показать превью pdf файла
  const showAsanasModal = useCallback(() => setIsAsanasModalVisible(true), [])

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
          [editingBlock]: [...(prevData[editingBlock] ?? []), asanaMap[id]]
        }
      })

      if (isMobile) {
        hideAsanasModal()
      }
    },
    [asanaMap, builderData, editingBlock, hideAsanasModal, isMobile]
  )

  const pdfAsanaData = useMemo(() => {
    return {
      documentTitle,
      asanas: builderData
    }
  }, [builderData, documentTitle])

  // Сгенерировать pdf файл
  const generatePdf = useCallback(async () => {
    const pdfDoc = pdf(PDFDocument(pdfAsanaData))

    pdfDoc.updateContainer(PDFDocument(pdfAsanaData))

    const blob = await pdfDoc.toBlob()

    saveAs(blob, documentTitle)

    reachGoal('save_pdf')
  }, [pdfAsanaData, documentTitle])

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event

      if (!!over?.id && active.id !== over.id) {
        setBuilderData((prevData) => {
          const [, oldIndex] = (active.id as string).split('-')
          const [, newIndex] = (over.id as string).split('-')

          const sortedItems = arrayMove(
            prevData[editingBlock],
            +oldIndex,
            +newIndex
          )

          return {
            ...prevData,
            [editingBlock]: sortedItems
          }
        })
      }
    },
    [editingBlock]
  )

  const onDragStart = useCallback(
    ({active}: DragStartEvent) => {
      const {containerId} = active.data.current?.sortable ?? {}

      if (containerId && containerId !== editingBlock) {
        setEditingBlock(containerId)
      }
    },
    [editingBlock]
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

  const onDocumentTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDocumentTitle(event.target.value)
    },
    []
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

  const addAsanaToBlock = useCallback(
    (
      asanaIndex: number,
      block: 'repeating' | 'dynamic',
      action: 'add' | 'delete',
      blockId: string
    ) => {
      setBuilderData((prevData) => {
        return {
          ...prevData,
          [blockId]: prevData[blockId].map((asana, index) =>
            index === asanaIndex
              ? {
                  ...asana,
                  ...(block === 'repeating'
                    ? {isAsanaInRepeatingBlock: action === 'add' ? true : false}
                    : {isAsanaInDynamicBlock: action === 'add' ? true : false})
                }
              : asana
          )
        }
      })
    },
    []
  )

  const copyAsana = useCallback(
    (asana: Asana, index: number, blockId: string) => {
      setBuilderData((prevData) => {
        const newSequence = [...prevData[blockId]]

        newSequence.splice(index, 0, asana)

        return {
          ...prevData,
          [blockId]: newSequence
        }
      })
    },
    []
  )

  const toggleTimeSettingsVisible = useCallback(
    () => setIsTimeSettingsVisible((prevData) => !prevData),
    []
  )

  const hideTimeSettingsModel = useCallback(
    () => setIsTimeSettingsVisible(false),
    []
  )

  const saveTimeSettings = useCallback(
    (data: TimeSettingsFormInputs) => {
      setTimeSettings(data)
      hideTimeSettingsModel()

      setItem(LOCAL_STORAGE_TIME_SETTINGS, data)
    },
    [hideTimeSettingsModel]
  )

  const deleteAsanasBlock = useCallback(
    (id: string) => {
      setBuilderData((prevData) => {
        delete prevData[id]

        return {...prevData}
      })

      if (editingBlock === id) {
        const blockIds = Object.keys(builderData)

        // Если вообще нет блоков асан, то добавим редактируемый блок - 0
        // Иначе найдем последний
        setEditingBlock(!blockIds.length ? '0' : blockIds[blockIds.length - 1])
      }
    },
    [builderData, editingBlock]
  )

  const addAsanasBlock = useCallback(() => {
    let nextEditingBlockId = '0'

    Object.keys(builderData).forEach((key) => {
      if (+key >= +nextEditingBlockId) {
        nextEditingBlockId = `${+key + 1}`
      }
    })

    setEditingBlock(nextEditingBlockId)

    setBuilderData((prevData) => {
      return {
        ...prevData,
        [nextEditingBlockId]: []
      }
    })
  }, [builderData])

  const sequenceBlocks = useMemo(() => {
    let lastIndex = 0

    return Object.keys(builderData).map((key, index) => {
      const dataWithIndexes = builderData[key].map((data) => {
        if (data.alias === 'separator') {
          return data
        }

        lastIndex += 1

        return {...data, count: lastIndex}
      })

      return (
        <div
          key={index}
          className={styles.blockWrapper}
          onClick={() => setEditingBlock(key)}>
          <Sequence
            id={key}
            data={dataWithIndexes}
            isMobile={isMobile}
            onDeleteAsana={deleteAsanaById}
            onDeleteBlock={deleteAsanasBlock}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onAddAsanaButtonClick={showAsanasModal}
            addAsanaToBlock={addAsanaToBlock}
            isEditing={editingBlock === key}
            copyAsana={copyAsana}
          />
        </div>
      )
    })
  }, [
    builderData,
    isMobile,
    deleteAsanaById,
    deleteAsanasBlock,
    onDragEnd,
    onDragStart,
    showAsanasModal,
    addAsanaToBlock,
    editingBlock,
    copyAsana
  ])

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <div className={styles.root}>
        {!isMobile && (
          <Resizable
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRight: `1px solid ${isDarkTheme ? '#424242' : '#ddd'}`
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
                asanas={asanas}
                onAsanaClick={onAsanaClick}
                size="small"
              />
            </div>
          </Resizable>
        )}
        <div className={styles.previewWrapper}>
          <div className={styles.scrollContainer}>
            <div className={styles.scrollContainerInner}>
              <Input
                placeholder="Введите название вашей последовательности..."
                label="Название последовательности"
                value={documentTitle}
                onChange={onDocumentTitleChange}
                name="documentTitle"
              />
              <div className={styles.sequenceBlocks}>{sequenceBlocks}</div>
              <Button
                block
                className={styles.addBlockButton}
                onClick={addAsanasBlock}>
                Добавить блок асан
              </Button>
            </div>
          </div>

          {!!builderLength &&
            (!!sequenceDuration.hours || !!sequenceDuration.minutes) && (
              <div className={styles.timeWrapper}>
                <Button
                  icon={<SettingOutlined />}
                  size="small"
                  className={styles.settingsButton}
                  onClick={toggleTimeSettingsVisible}
                />
                <div>{`Время последовательности: ${
                  sequenceDuration.hours ? `${sequenceDuration.hours}ч` : ''
                } ${
                  sequenceDuration.minutes ? `${sequenceDuration.minutes}м` : ''
                }`}</div>
              </div>
            )}

          <div className={styles.actionButtons}>
            <Button
              type="primary"
              size="large"
              block={isMobile}
              danger
              onClick={clearSequence}>
              Очистить
            </Button>
            <Button
              type="primary"
              size="large"
              block={isMobile}
              onClick={showPreview}>
              Посмотреть результат
            </Button>
            <Button
              type="primary"
              size="large"
              block={isMobile}
              onClick={generatePdf}>
              Сохранить в PDF
            </Button>
          </div>
          <Modal
            centered
            okText="Сохранить"
            cancelText="Отмена"
            width={310}
            closeIcon={null}
            footer={null}
            open={isTimeSettingsVisible}
            onCancel={hideTimeSettingsModel}>
            <SequenceTimeForm
              onSubmit={saveTimeSettings}
              defaultValues={timeSettings}
              footerButtons={[
                <Button key="reset" onClick={hideTimeSettingsModel}>
                  Отмена
                </Button>,
                <Button type="primary" htmlType="submit" key="submit">
                  Сохранить
                </Button>
              ]}
            />
          </Modal>
          <Modal
            title="Ваша последовательность"
            centered
            okText="Скачать"
            cancelText="Отмена"
            open={isPdfModalVisible}
            onOk={generatePdf}
            onCancel={hidePreview}
            destroyOnClose
            width={1000}
            {...(isMobile ? {footer: null} : {})}>
            <PdfViewer sequence={pdfAsanaData} />
          </Modal>
          <Modal
            title="Выберите асану"
            centered
            open={isAsanasModalVisible}
            onCancel={hideAsanasModal}
            className={isMobile ? styles.modal : undefined}
            footer={null}>
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
          </Modal>
        </div>
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

  const theme = context.req.cookies.seq_theme || 'light'

  const asanas = await getAsanasList()
  const asanaGroups = await getAsanaGroupsList()

  asanas.sort((a, b) => (a.name > b.name ? 1 : -1))
  asanaGroups.sort((a, b) => (a.name > b.name ? 1 : -1))

  const asanaMap = asanas.reduce((acc: Record<string, Asana>, curValue) => {
    acc[curValue.id] = curValue

    return acc
  }, {})

  return {props: {isMobile, theme, asanas, asanaGroups, asanaMap}}
}

export default CreateSequencePage
