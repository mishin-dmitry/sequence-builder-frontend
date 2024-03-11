'use client'

import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {Input} from 'components/input'
import {useUser} from 'context/user'

import {Textarea} from 'components/textarea'
import {Button, Modal} from 'antd'
import {SettingOutlined} from '@ant-design/icons'
import {Sequence} from 'components/sequence'
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

interface SequenceEditorProps {
  data: Record<string, TAsana[]>
  editingBlock: string
  title: string
  description?: string
  isPublic?: boolean
  asanasListNode: React.ReactNode
  isViewMode?: boolean
  target?: 'sequence' | 'bunch'
  maxBlocksCount?: number
  onSave: () => Promise<void>
  onDelete?: () => Promise<void>
  onDuplicate?: () => void
  scrollToAsana: (id: number) => void
  onChange: (data: Record<string, TAsana[]>) => void
  onChangeEditingBlock?: (id: string) => void
  onChangeTitle: (title: string) => void
  onChangeDescription?: (description: string) => void
  onChangePublic?: (checked: boolean) => void
}

const DEFAULT_TIME_SETTINGS = {
  pranayamaTime: dayjs().minute(10).second(0),
  warmUpTime: dayjs().minute(5).second(0),
  namaskarTime: dayjs().minute(10).second(0),
  asanaTime: dayjs().minute(0).second(30),
  shavasanaTime: dayjs().minute(15).second(0)
}

export const SequenceEditor: React.FC<SequenceEditorProps> = ({
  onSave,
  data: dataProp,
  onChange,
  editingBlock,
  onChangeEditingBlock,
  title,
  onChangeTitle,
  description,
  onChangeDescription,
  asanasListNode,
  onDelete,
  isViewMode,
  scrollToAsana,
  onDuplicate: onDuplicateProp,
  target = 'sequence',
  maxBlocksCount = 10
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)
  const [isAsanasModalVisible, setIsAsanasModalVisible] = useState(false)
  const [isTimeSettingsVisible, setIsTimeSettingsVisible] = useState(false)
  const [isInputEmpty, setIsInputEmpty] = useState(false)

  const [draggingAsana, setDraggingAsana] = useState<null | TAsana>(null)
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null)

  const [rows, setRows] = useState<string[]>(
    Object.keys(dataProp ?? {}).map((key) => key)
  )

  const {isMobile} = useSettings()

  const isTargetSequence = target === 'sequence'

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

    Object.keys(dataProp ?? {}).forEach((key) => {
      const currentBlock = dataProp[key] ?? []

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
  }, [dataProp])

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
        delay: 200,
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
    setRows(Object.keys(dataProp ?? {}).map((key) => key))
  }, [dataProp])

  useEffect(() => {
    if (!isTargetSequence) return

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
  }, [isTargetSequence])

  useEffect(() => {
    if (!isTargetSequence) return

    const time = Object.entries(timeSettings).reduce(
      (acc, curValue) => {
        const [key, time] = curValue

        if (!time) return acc

        const seconds = time.second()
        const minutes = time.minute()

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
      block: 'repeating' | 'dynamic',
      action: 'add' | 'delete',
      blockId: string
    ) => {
      const newData = {
        ...data,
        [blockId]: data[blockId].map((asana, index) =>
          index === asanaIndex
            ? {
                ...asana,
                ...(block === 'repeating'
                  ? {inRepeatingBlock: action === 'add'}
                  : {inDynamicBlock: action === 'add'})
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

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.scrollContainer}>
        <div>
          {isAuthorized && !isViewMode && (
            <div className={styles.controls}>
              <Input
                placeholder={
                  isTargetSequence
                    ? 'Введите название вашей последовательности...'
                    : 'Введите название связки асан...'
                }
                label={
                  isTargetSequence
                    ? 'Название последовательности'
                    : 'Название связки асан'
                }
                value={title}
                onChange={onTitleChange}
                name="title"
                errorMessage={
                  isInputEmpty
                    ? isTargetSequence
                      ? 'Введите название последовательности'
                      : 'Введите название связки асан'
                    : ''
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
              // onDragOver={onDragOver}
              measuring={{droppable: {strategy: MeasuringStrategy.Always}}}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}>
              <SortableContext
                strategy={verticalListSortingStrategy}
                items={rows}>
                {rows.map((rowId) => {
                  return (
                    <div
                      key={rowId}
                      id={rowId}
                      className={styles.blockWrapper}
                      onClick={
                        onChangeEditingBlock
                          ? () => onChangeEditingBlock(rowId)
                          : undefined
                      }>
                      <Sequence
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
                      />
                    </div>
                  )
                })}
              </SortableContext>
              {typeof document !== 'undefined' &&
                createPortal(
                  <DragOverlay adjustScale={false}>
                    {draggingRowId && !draggingAsana && (
                      <div
                        className={clsx(styles.blockWrapper, styles.dragging)}>
                        <Sequence
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
                          addAsanaToBlock(1, 'repeating', 'add', '1')
                        }
                        blockId={'-1'}
                      />
                    )}
                  </DragOverlay>,
                  document.body
                )}
            </DndContext>
          </div>

          {!isViewMode && maxBlocksCount > Object.keys(data).length && (
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

      {!!builderLength &&
        (!!sequenceDuration.hours || !!sequenceDuration.minutes) &&
        isTargetSequence && (
          <div className={styles.timeWrapper}>
            {!isViewMode && (
              <Button
                icon={<SettingOutlined />}
                size="small"
                className={styles.settingsButton}
                onClick={toggleTimeSettingsVisible}
              />
            )}
            <div>{`Время последовательности: ${
              sequenceDuration.hours ? `${sequenceDuration.hours}ч` : ''
            } ${
              sequenceDuration.minutes ? `${sequenceDuration.minutes}м` : ''
            }`}</div>
          </div>
        )}

      <div className={styles.actionButtons}>
        {!isViewMode &&
          (typeof onDelete === 'function' ? (
            <ConfirmButton
              title="Удалить последовательность"
              description="Вы действительно хотите удалить последовательность?"
              onClick={onDelete}
              size="large"
              okText="Удалить">
              Удалить
            </ConfirmButton>
          ) : (
            <ConfirmButton
              title="Очистить последовательность"
              description="Вы действительно хотите очистить последовательность?"
              size="large"
              okText="Очистить"
              onClick={clearSequence}>
              Очистить
            </ConfirmButton>
          ))}
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
        {isAuthorized && !isViewMode && (
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
