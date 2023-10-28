import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import styles from './styles.module.css'
import {AsanasList} from 'components/asanas-list'
import PdfViewer from 'components/pdf-viewer'
import type {
  Asana,
  AsanaGroup,
  SequenceRequest,
  Sequence as SequenceType
} from 'types'
import {Button, Checkbox, Modal, Tooltip} from 'antd'
import {PDFDocument} from 'components/pdf-viewer/document'

import {saveAs} from 'file-saver'
import {pdf} from '@react-pdf/renderer'
import {Sequence} from 'components/sequence'
import {arrayMove} from 'lib/array-move'

import type {GetServerSideProps} from 'next/types'
import {Resizable} from 're-resizable'
import {Input} from 'components/input'
import {getSequence} from 'api'
import {Meta} from 'components/meta'
import type {PageProps} from 'types/page-props'
import {reachGoal} from 'lib/metrics'
import {SearchFilter} from 'components/serch-filter'
import {getItem, setItem} from 'lib/local-storage'
import {LOCAL_STORAGE_TIME_SETTINGS} from 'lib/constants'

import debounce from 'lodash.debounce'
import clsx from 'clsx'
import {QuestionCircleOutlined, SettingOutlined} from '@ant-design/icons'
import {TimeSettingsFormInputs, SequenceTimeForm} from './sequence-time-form'
import dayjs from 'dayjs'
import type {DragStartEvent, DragEndEvent} from '@dnd-kit/core'
import {useSequence} from '../hooks'
import {Textarea} from 'components/textarea'
import {type CheckboxChangeEvent} from 'antd/es/checkbox'
import {useRouter} from 'next/router'
import {ConfirmButton} from 'components/confirm-button'
import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
import {useAsanas} from 'context/asanas'

const DEFAULT_TIME_SETTINGS = {
  pranayamaTime: dayjs().minute(10).second(0),
  warmUpTime: dayjs().minute(5).second(0),
  namaskarTime: dayjs().minute(10).second(0),
  asanaTime: dayjs().minute(0).second(30),
  shavasanaTime: dayjs().minute(15).second(0)
}

const CreateSequencePage: React.FC<
  PageProps & {editingSequence: SequenceType}
> = ({
  isMobile,
  editingSequence: {
    userId,
    title = '',
    description: initialDescription = '',
    isPublic: initialIsPublic,
    blocks
  }
}) => {
  const {asanas: allAsanas, asanaGroups, asanasMap} = useAsanas()
  const [documentTitle, setDocumentTitle] = useState<string>(title)
  const [description, setDescription] = useState<string>(initialDescription)
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)
  const [isAsanasModalVisible, setIsAsanasModalVisible] = useState(false)
  const [asanas, setAsanas] = useState(allAsanas)
  const [isTimeSettingsVisible, setIsTimeSettingsVisible] = useState(false)
  const [editingBlock, setEditingBlock] = useState('0')

  const router = useRouter()

  const [builderData, setBuilderData] = useState<Record<string, Asana[]>>(
    blocks.reduce((acc: Record<string, Asana[]>, curValue, index) => {
      acc[index] = curValue.asanas.map(({id, options: {inRepeatingBlock}}) => ({
        ...asanasMap[id],
        isAsanaInRepeatingBlock: inRepeatingBlock
      }))

      return acc
    }, {})
  )

  const [isPublic, setIsPublic] = useState(initialIsPublic)

  const {updateSequence, isFetching} = useSequence()
  const {user, isAuthorized} = useUser()

  const onSaveButtonClick = useCallback(async () => {
    const data: SequenceRequest = {
      title: documentTitle,
      description,
      isPublic,
      blocks: Object.values(builderData).map((block) =>
        block.map(({id, isAsanaInRepeatingBlock = false}) => ({
          asanaId: id,
          inRepeatingBlock: isAsanaInRepeatingBlock
        }))
      )
    }

    await updateSequence(router.query.id as string, data)
  }, [
    documentTitle,
    description,
    isPublic,
    builderData,
    updateSequence,
    router.query.id
  ])

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
    if (!!user && user.id !== userId) {
      router.replace(Urls.CREATE_SEQUENCE)
    }
  }, [router, user, userId])

  useEffect(() => {
    if (!isFetching && !isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, isFetching, router])

  useEffect(() => {
    const timeSettingsFromLS = getItem<
      Record<keyof TimeSettingsFormInputs, string>
    >(LOCAL_STORAGE_TIME_SETTINGS)

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
    setDescription('')
    setEditingBlock('0')
    setIsPublic(false)

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
          [editingBlock]: [...(prevData[editingBlock] ?? []), asanasMap[id]]
        }
      })

      if (isMobile) {
        hideAsanasModal()
      }
    },
    [asanasMap, builderData, editingBlock, hideAsanasModal, isMobile]
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

  const onDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(event.target.value)
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

  const addAsanaToRepeatingBlock = useCallback(
    (asanaIndex: number, action: 'add' | 'delete', blockId: string) => {
      setBuilderData((prevData) => {
        return {
          ...prevData,
          [blockId]: prevData[blockId].map((asana, index) =>
            index === asanaIndex
              ? {
                  ...asana,
                  isAsanaInRepeatingBlock: action === 'add' ? true : false
                }
              : asana
          )
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

  const onCheckboxChange = useCallback((event: CheckboxChangeEvent) => {
    setIsPublic(event.target.checked)
  }, [])

  const sequenceBlocks = useMemo(() => {
    return Object.keys(builderData).map((key, index) => (
      <div
        key={index}
        className={styles.blockWrapper}
        onClick={() => setEditingBlock(key)}>
        <Sequence
          id={key}
          data={builderData[key]}
          isMobile={isMobile}
          onDeleteAsana={deleteAsanaById}
          onDeleteBlock={deleteAsanasBlock}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onAddAsanaButtonClick={showAsanasModal}
          addAsanaToRepeatingBlock={addAsanaToRepeatingBlock}
          isEditing={editingBlock === key}
        />
      </div>
    ))
  }, [
    addAsanaToRepeatingBlock,
    deleteAsanaById,
    editingBlock,
    isMobile,
    builderData,
    deleteAsanasBlock,
    onDragEnd,
    onDragStart,
    showAsanasModal
  ])

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
              <Textarea
                name="description"
                label="Описание последовательности"
                placeholder="Введите описание вашей последовательности..."
                className={styles.textarea}
                value={description}
                onChange={onDescriptionChange}
              />
              <div className={styles.checkbox}>
                <Checkbox checked={isPublic} onChange={onCheckboxChange}>
                  Видна другим
                </Checkbox>
                <Tooltip title="Последовательность будет доступна для просмотра другим пользователям">
                  <QuestionCircleOutlined />
                </Tooltip>
              </div>
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
            <ConfirmButton
              okText="Очистить"
              title="Очистить последовательность"
              size="large"
              block={isMobile}
              disabled={isFetching}
              onClick={clearSequence}
              description="Вы действительно хотите очистить последовательность?">
              Очистить
            </ConfirmButton>
            <Button size="large" block={isMobile} onClick={showPreview}>
              Посмотреть результат
            </Button>
            <Button size="large" block={isMobile} onClick={generatePdf}>
              Скачать в PDF
            </Button>
            <Button
              type="primary"
              size="large"
              block={isMobile}
              loading={isFetching}
              onClick={onSaveButtonClick}>
              Сохранить
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
            <PdfViewer sequence={pdfAsanaData} isMobile={isMobile} />
          </Modal>
          <Modal
            title="Выберите асану"
            centered
            open={isAsanasModalVisible}
            onCancel={hideAsanasModal}
            footer={null}>
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

  const editingSequence = await getSequence(context.query.id as string, {
    cookies: context.req.headers.cookie || ''
  })

  return {props: {isMobile, editingSequence}}
}

export default CreateSequencePage
