'use client'

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import {Input} from 'components/input'
import {useUser} from 'context/user'

import {Textarea} from 'components/textarea'
import {Button, Modal} from 'antd'
import {SettingOutlined} from '@ant-design/icons'
import {SequenceRow} from 'components/sequence-row'
import {arrayMove} from 'lib/array-move'
import {reachGoal} from 'lib/metrics'
import {PDFDocument} from 'components/pdf-viewer/document'
import {saveAs} from 'file-saver'
import {pdf} from '@react-pdf/renderer'
import {SequenceTimeForm, TimeSettingsFormInputs} from './sequence-time-form'
import {getItem, setItem} from 'lib/local-storage'
import {ConfirmButton} from 'components/confirm-button'
import {useSettings} from 'context/settings'

import {
  type DragStartEvent,
  type DragEndEvent,
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  MeasuringStrategy,
  DragOverlay
} from '@dnd-kit/core'

import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'

import type {Asana as TAsana} from 'types'

import {LOCAL_STORAGE_TIME_SETTINGS} from 'lib/constants'
import {Urls} from 'lib/urls'

import dayjs from 'dayjs'
import styles from './styles.module.css'
import PdfViewer from 'components/pdf-viewer'
import {createPortal} from 'react-dom'
import clsx from 'clsx'
import {Asana} from 'components/asana'
import {BlockType} from 'components/pdf-viewer/utils'
import {SequenceContext} from 'components/main-page-editor'

export enum Target {
  SEQUENCE = 'sequence',
  BUNCH = 'bunch'
}

export enum Action {
  ADD = 'add',
  DELETE = 'delete'
}

interface SequenceEditorProps {
  asanasListNode: React.ReactNode
  target?: Target
  maxBlocksCount?: number
  onSave: () => Promise<void>
  onDelete?: () => Promise<void>
  onDuplicate?: () => void
  scrollToAsana: (id: number) => void
  onChange: (data: Record<string, TAsana[]>) => void
  onChangeEditingBlock?: (id: string) => void
  onChangeTitle: (title: string) => void
  onChangeDescription?: (description: string) => void
  filterContinuingAsanas?: (value: boolean) => void
}

const DEFAULT_TIME_SETTINGS = {
  pranayamaTime: dayjs().minute(10).second(0),
  warmUpTime: dayjs().minute(5).second(0),
  namaskarTime: dayjs().minute(10).second(0),
  asanaTime: dayjs().minute(0).second(30),
  shavasanaTime: dayjs().minute(15).second(0)
}

export const SequenceEditor: React.FC<SequenceEditorProps> = ({
  asanasListNode,
  target = Target.SEQUENCE,
  maxBlocksCount = 10,
  onSave,
  onChange,
  onChangeEditingBlock,
  onChangeTitle,
  onChangeDescription,
  onDuplicate: onDuplicateProp,
  onDelete,
  scrollToAsana,
  filterContinuingAsanas
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)
  const [isAsanasModalVisible, setIsAsanasModalVisible] = useState(false)
  const [isTimeSettingsVisible, setIsTimeSettingsVisible] = useState(false)
  const [isInputEmpty, setIsInputEmpty] = useState(false)
  const [draggingAsana, setDraggingAsana] = useState<null | TAsana>(null)
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null)

  const {sequence, description, title, editingBlock} =
    useContext(SequenceContext)

  const [rows, setRows] = useState<string[]>(
    Object.keys(sequence ?? {}).map((key) => key)
  )

  const {isMobile} = useSettings()

  const isTargetSequence = target === Target.SEQUENCE

  const [sequenceDuration, setSequenceDuration] = useState<{
    hours?: number
    minutes?: number
  }>({})

  const [timeSettings, setTimeSettings] = useState<TimeSettingsFormInputs>(
    DEFAULT_TIME_SETTINGS
  )

  const data = useMemo(() => {
    let count = 0

    const result: Record<string, TAsana[]> = {}

    Object.keys(sequence ?? {}).forEach((key) => {
      const currentBlock = sequence[key] ?? []

      result[key] = currentBlock.map((asana, index) => {
        if (asana.alias === 'separator')
          return {
            ...asana,
            key: `${key}.${asana.id}.${index}`
          }

        count++

        return {
          ...asana,
          key: `${key}.${asana.id}.${index}`,
          count
        }
      })
    })

    return result
  }, [sequence])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
        delay: 200
      }
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 100,
        tolerance: 5
      }
    }),
    useSensor(PointerSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  useEffect(() => {
    setRows(Object.keys(sequence ?? {}).map((key) => key))
  }, [sequence])

  useEffect(() => {
    if (!isTargetSequence) return

    const timeSettingsFromLS = getItem<
      Record<keyof TimeSettingsFormInputs, string>
    >(LOCAL_STORAGE_TIME_SETTINGS)

    setTimeSettings(
      timeSettingsFromLS
        ? {
            asanaTime: !timeSettingsFromLS.asanaTime
              ? null
              : dayjs(timeSettingsFromLS.asanaTime),
            namaskarTime: !timeSettingsFromLS.namaskarTime
              ? null
              : dayjs(timeSettingsFromLS.namaskarTime),
            pranayamaTime: !timeSettingsFromLS.pranayamaTime
              ? null
              : dayjs(timeSettingsFromLS.pranayamaTime),
            shavasanaTime: !timeSettingsFromLS.shavasanaTime
              ? null
              : dayjs(timeSettingsFromLS.shavasanaTime),
            warmUpTime: !timeSettingsFromLS.warmUpTime
              ? null
              : dayjs(timeSettingsFromLS.warmUpTime)
          }
        : DEFAULT_TIME_SETTINGS
    )
  }, [isTargetSequence])

  useEffect(() => {
    if (!isTargetSequence) return

    const time = Object.entries(timeSettings).reduce(
      (acc, curValue) => {
        const [key, time] = curValue

        if (!time) return acc

        const seconds = isNaN(time.second()) ? 0 : time.second()
        const minutes = isNaN(time.minute()) ? 0 : time.minute()

        if (key === 'asanaTime') {
          Object.values(data).forEach((asanasBlock) => {
            asanasBlock.forEach(({inRepeatingBlock}) => {
              acc.seconds += inRepeatingBlock ? seconds * 2 : seconds
              acc.minutes += inRepeatingBlock ? minutes * 2 : minutes
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
  }, [timeSettings, data, isTargetSequence])

  // Если добавили асану, закрое модалку с выбором асан
  useEffect(() => {
    if (isMobile && isAsanasModalVisible) {
      setIsAsanasModalVisible(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const {isAuthorized} = useUser()

  const onSaveButtonClick = useCallback(async () => {
    if (!title) {
      setIsInputEmpty(true)

      return
    }

    try {
      setIsSaving(true)
      await onSave()
    } catch {
    } finally {
      setIsSaving(false)
    }
  }, [onSave, title])

  const onTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value && isInputEmpty) {
        setIsInputEmpty(false)
      }

      onChangeTitle(event.target.value)
    },
    [isInputEmpty, onChangeTitle]
  )

  const onDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeDescription?.(event.target.value)
    },
    [onChangeDescription]
  )

  // Удалить асану в редактируемой последовательности
  const deleteAsanaById = useCallback(
    (asanaIndex: number, blockId: string): void => {
      const newData = {
        ...data,
        [blockId]: (data[blockId] ?? []).filter(
          (_, index) => index !== asanaIndex
        )
      }

      onChange(newData)
    },
    [data, onChange]
  )

  // Удалить блок асан
  const deleteAsanasBlock = useCallback(
    (id: string) => {
      const newData = {...data}

      delete newData[id]

      onChange(newData)
      setRows((prev) => prev.filter((rowId) => rowId !== id))

      if (editingBlock === id && onChangeEditingBlock) {
        const blockIds = Object.keys(data)

        // Если вообще нет блоков асан, то добавим редактируемый блок - 0
        // Иначе найдем последний
        onChangeEditingBlock(
          !blockIds.length
            ? 'block-1'
            : `block-${blockIds[blockIds.length - 1]}`
        )
      }
    },
    [data, editingBlock, onChange, onChangeEditingBlock]
  )

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event

      if (draggingAsana) {
        setDraggingAsana(null)
      }

      if (draggingRowId) {
        setDraggingRowId(null)
      }

      if (!over) return

      const {id: activeRowId, data: activeData} = active

      const {id: overRowId} = over

      if (activeData.current?.type === 'Block') {
        if (overRowId === activeRowId) return

        const activeRowIndex = rows.indexOf(activeRowId as string)
        const overRowIndex = rows.indexOf(overRowId as string)

        const sortedRows = arrayMove(rows, activeRowIndex, overRowIndex)

        const newData = {} as any

        sortedRows.forEach((rowId) => {
          newData[rowId] = data[rowId]
        })

        setRows(sortedRows)
        onChange(newData)

        return
      }

      if (!!over.id && active.id !== over.id) {
        const oldIndex = active.data.current?.index
        const newIndex = over.data.current?.index

        const newData = {
          ...data,
          [editingBlock]: arrayMove(data[editingBlock], +oldIndex, +newIndex)
        }

        onChange(newData)
      }
    },
    [data, draggingAsana, draggingRowId, editingBlock, onChange, rows]
  )

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const activeBlockId =
        event.active.data.current?.blockId ?? event.active.id

      if (editingBlock !== activeBlockId) {
        onChangeEditingBlock?.(activeBlockId)
      }

      if (event.active.data.current?.type === 'Block') {
        setDraggingRowId(activeBlockId)

        return
      }

      setDraggingAsana(event.active.data.current?.data)
    },
    [editingBlock, onChangeEditingBlock]
  )

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

  const addAsanaToBlock = useCallback(
    (
      asanaIndex: number,
      block: BlockType.REPEATING | BlockType.DYNAMIC,
      action: Action,
      blockId: string
    ) => {
      const newData = {
        ...data,
        [blockId]: data[blockId].map((asana, index) =>
          index === asanaIndex
            ? {
                ...asana,
                ...(block === BlockType.REPEATING
                  ? {inRepeatingBlock: action === Action.ADD}
                  : {inDynamicBlock: action === Action.ADD})
              }
            : asana
        )
      }

      onChange(newData)
    },
    [data, onChange]
  )

  const copyAsana = useCallback(
    (asana: TAsana, index: number, blockId: string) => {
      const newSequence = [...data[blockId]]

      newSequence.splice(index, 0, asana)

      const newData = {
        ...data,
        [blockId]: newSequence
      }

      onChange(newData)
    },
    [data, onChange]
  )

  const addAsanasBlock = useCallback(() => {
    let nextEditingBlockId = '1'

    Object.keys(data).forEach((key) => {
      const newKey = +key.replace('block-', '')

      if (newKey >= +nextEditingBlockId) {
        nextEditingBlockId = `${newKey + 1}`
      }
    })

    const nextBlock = `block-${nextEditingBlockId}`

    onChangeEditingBlock?.(nextBlock)
    setRows((prev) => [...prev, nextBlock])

    const newData = {
      ...data,
      [nextBlock]: []
    }

    onChange(newData)
  }, [data, onChange, onChangeEditingBlock])

  const builderLength = useMemo(() => {
    return Object.values(data).reduce(
      (acc, curValue) => (acc += curValue.length),
      0
    )
  }, [data])

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

  // Очистить последовательность
  const clearSequence = useCallback(() => {
    onChange({})
    onChangeTitle('')
    onChangeDescription?.('')
    onChangeEditingBlock?.('block-1')

    reachGoal('clear_sequence')
  }, [onChange, onChangeDescription, onChangeEditingBlock, onChangeTitle])

  const pdfAsanaData = useMemo(() => {
    return {
      asanas: data
    }
  }, [data])

  // Сгенерировать pdf файл
  const generatePdf = useCallback(async () => {
    const pdfDoc = pdf(PDFDocument(pdfAsanaData))

    pdfDoc.updateContainer(PDFDocument(pdfAsanaData))

    const blob = await pdfDoc.toBlob()

    saveAs(blob, title.replaceAll('.', '_'))

    reachGoal('save_pdf')
  }, [pdfAsanaData, title])

  const onDuplicate = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault()

      onDuplicateProp?.()

      window.setTimeout(() => {
        window.open(
          `${window.location.origin}${Urls.CREATE_SEQUENCE}`,
          '_blank'
        )
      }, 0)
    },
    [onDuplicateProp]
  )

  const targetName = isTargetSequence ? 'последовательность' : 'связку асан'
  const plurTargetName = isTargetSequence ? 'последовательности' : 'связки асан'

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.scrollContainer}>
        <div>
          {isAuthorized && (
            <div className={styles.controls}>
              <Input
                placeholder={`Введите название ${plurTargetName}`}
                label={`Название ${plurTargetName}`}
                value={title}
                onChange={onTitleChange}
                name="title"
                errorMessage={
                  isInputEmpty ? `Введите название ${plurTargetName}` : ''
                }
              />
              {onDescriptionChange && isTargetSequence && (
                <Textarea
                  name="description"
                  label="Описание последовательности"
                  placeholder="Введите описание вашей последовательности..."
                  className={styles.withTopMargin}
                  value={description}
                  onChange={onDescriptionChange}
                />
              )}
            </div>
          )}
          <div className={styles.sequenceBlocks}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              measuring={{droppable: {strategy: MeasuringStrategy.Always}}}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}>
              <SortableContext
                strategy={verticalListSortingStrategy}
                items={rows}>
                {rows.map((rowId) => (
                  <div
                    key={rowId}
                    id={rowId}
                    className={styles.blockWrapper}
                    onClick={
                      onChangeEditingBlock
                        ? () => onChangeEditingBlock(rowId)
                        : undefined
                    }>
                    <SequenceRow
                      id={rowId}
                      data={data[rowId]}
                      onDeleteAsana={deleteAsanaById}
                      onDeleteBlock={
                        isTargetSequence ? deleteAsanasBlock : undefined
                      }
                      onAddAsanaButtonClick={showAsanasModal}
                      addAsanaToBlock={addAsanaToBlock}
                      isEditing={editingBlock === rowId}
                      copyAsana={copyAsana}
                      scrollToAsana={scrollToAsana}
                      target={target}
                      filterContinuingAsanas={filterContinuingAsanas}
                    />
                  </div>
                ))}
              </SortableContext>
              {typeof document !== 'undefined' &&
                createPortal(
                  <DragOverlay adjustScale={false}>
                    {draggingRowId && !draggingAsana && (
                      <div
                        className={clsx(styles.blockWrapper, styles.dragging)}>
                        <SequenceRow
                          id={draggingRowId}
                          data={data[draggingRowId]}
                          onDeleteAsana={deleteAsanaById}
                          onDeleteBlock={
                            isTargetSequence ? deleteAsanasBlock : undefined
                          }
                          onAddAsanaButtonClick={showAsanasModal}
                          addAsanaToBlock={addAsanaToBlock}
                          isEditing
                          copyAsana={copyAsana}
                          scrollToAsana={scrollToAsana}
                        />
                      </div>
                    )}
                    {/* Мок асаны, для dnd */}
                    {draggingAsana && !draggingRowId && (
                      <Asana
                        id={draggingAsana.id.toString()}
                        asana={draggingAsana}
                        index={1}
                        className={styles.dragging}
                        copyAsana={() => copyAsana(draggingAsana, 1, '1')}
                        scrollToAsana={scrollToAsana}
                        onDeleteAsana={() => deleteAsanaById(1, '1')}
                        addAsanaToBlock={() =>
                          addAsanaToBlock(
                            1,
                            BlockType.REPEATING,
                            Action.ADD,
                            '1'
                          )
                        }
                        blockId="-1"
                      />
                    )}
                  </DragOverlay>,
                  document.body
                )}
            </DndContext>
          </div>

          {maxBlocksCount > Object.keys(data).length && (
            <Button
              block
              size="large"
              className={styles.withTopMargin}
              onClick={addAsanasBlock}>
              Добавить блок асан
            </Button>
          )}
        </div>
      </div>

      {!!builderLength && isTargetSequence && (
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
            sequenceDuration.minutes ? `${sequenceDuration.minutes}м` : '0'
          }`}</div>
        </div>
      )}

      <div className={styles.actionButtons}>
        {typeof onDelete === 'function' ? (
          <ConfirmButton
            title={`Удалить ${targetName}`}
            description={`Вы действительно хотите удалить ${targetName}?`}
            onClick={onDelete}
            size="large"
            okText="Удалить">
            Удалить
          </ConfirmButton>
        ) : (
          <ConfirmButton
            title={`Очистить ${targetName}`}
            description={`Вы действительно хотите очистить ${targetName}?`}
            size="large"
            okText="Очистить"
            onClick={clearSequence}>
            Очистить
          </ConfirmButton>
        )}
        {isAuthorized && isTargetSequence && (
          <Button
            size="large"
            href={Urls.CREATE_SEQUENCE}
            rel="noopener noreferrer"
            target="_blank"
            onClick={onDuplicate}>
            Дублировать последовательность
          </Button>
        )}
        {isTargetSequence && (
          <>
            <Button size="large" onClick={showPreview}>
              Посмотреть результат
            </Button>
            <Button size="large" onClick={generatePdf}>
              Скачать в PDF
            </Button>
          </>
        )}
        {isAuthorized && (
          <Button
            type="primary"
            size="large"
            loading={isSaving}
            disabled={!builderLength || isInputEmpty}
            block={isMobile}
            onClick={onSaveButtonClick}>
            Сохранить
          </Button>
        )}
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
        footer={null}>
        {asanasListNode}
      </Modal>
    </div>
  )
}
