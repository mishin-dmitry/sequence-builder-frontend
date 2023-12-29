import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {Input} from 'components/input'
import {useUser} from 'context/user'

import {Textarea} from 'components/textarea'
import {Button, Checkbox, Modal, Tooltip} from 'antd'
import {QuestionCircleOutlined, SettingOutlined} from '@ant-design/icons'
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

import {type CheckboxChangeEvent} from 'antd/es/checkbox'
import type {DragStartEvent, DragEndEvent} from '@dnd-kit/core'
import type {Asana} from 'types'

import {LOCAL_STORAGE_TIME_SETTINGS} from 'lib/constants'
import {Urls} from 'lib/urls'

import dayjs from 'dayjs'
import styles from './styles.module.css'
import PdfViewer from 'components/pdf-viewer'

interface SequenceEditorProps {
  data: Record<string, Asana[]>
  editingBlock: string
  title: string
  description?: string
  isPublic?: boolean
  asanasListNode: React.ReactNode
  isViewMode?: boolean
  onSave: () => Promise<void>
  onDelete?: () => Promise<void>
  onDuplicate: () => void
  onChange: (data: Record<string, Asana[]>) => void
  onChangeEditingBlock: (id: string) => void
  onChangeTitle: (title: string) => void
  onChangeDescription: (description: string) => void
  onChangePublic: (checked: boolean) => void
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
  onChangePublic,
  isPublic,
  asanasListNode,
  onDelete,
  isViewMode,
  onDuplicate: onDuplicateProp
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)
  const [isAsanasModalVisible, setIsAsanasModalVisible] = useState(false)
  const [isTimeSettingsVisible, setIsTimeSettingsVisible] = useState(false)
  const [isInputEmpty, setIsInputEmpty] = useState(false)

  const {isMobile} = useSettings()

  const [sequenceDuration, setSequenceDuration] = useState<{
    hours?: number
    minutes?: number
  }>({})

  const [timeSettings, setTimeSettings] = useState<TimeSettingsFormInputs>(
    DEFAULT_TIME_SETTINGS
  )

  const data = useMemo(() => {
    let count = 0

    const result: Record<string, Asana[]> = {}

    Object.keys(dataProp).forEach((key) => {
      const currentBlock = dataProp[key]

      result[key] = currentBlock.map((asana) => {
        if (asana.alias === 'separator') return asana

        count++

        return {
          ...asana,
          count
        }
      })
    })

    return result
  }, [dataProp])

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
          Object.values(data).forEach((asanasBlock) => {
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
  }, [timeSettings, data])

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
      onChangeDescription(event.target.value)
    },
    [onChangeDescription]
  )

  const onCheckboxChange = useCallback(
    (event: CheckboxChangeEvent) => {
      onChangePublic(event.target.checked)
    },
    [onChangePublic]
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

      if (editingBlock === id) {
        const blockIds = Object.keys(data)

        // Если вообще нет блоков асан, то добавим редактируемый блок - 0
        // Иначе найдем последний
        onChangeEditingBlock(
          !blockIds.length ? '0' : blockIds[blockIds.length - 1]
        )
      }
    },
    [data, editingBlock, onChange, onChangeEditingBlock]
  )

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {active, over} = event

      if (!!over?.id && active.id !== over.id) {
        const [, oldIndex] = (active.id as string).split('-')
        const [, newIndex] = (over.id as string).split('-')

        const sortedItems = arrayMove(data[editingBlock], +oldIndex, +newIndex)

        const newData = {
          ...data,
          [editingBlock]: sortedItems
        }

        onChange(newData)
      }
    },
    [data, editingBlock, onChange]
  )

  const onDragStart = useCallback(
    ({active}: DragStartEvent) => {
      const {containerId} = active.data.current?.sortable ?? {}

      if (containerId && containerId !== editingBlock) {
        onChangeEditingBlock(containerId)
      }
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
                  ? {isAsanaInRepeatingBlock: action === 'add'}
                  : {isAsanaInDynamicBlock: action === 'add'})
              }
            : asana
        )
      }

      onChange(newData)
    },
    [data, onChange]
  )

  const copyAsana = useCallback(
    (asana: Asana, index: number, blockId: string) => {
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

  const sequenceBlocks = useMemo(() => {
    return Object.keys(data).map((key, index) => (
      <div
        key={index}
        className={styles.blockWrapper}
        onClick={() => onChangeEditingBlock(key)}>
        <Sequence
          id={key}
          data={data[key]}
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
    ))
  }, [
    data,
    deleteAsanaById,
    deleteAsanasBlock,
    onDragEnd,
    onDragStart,
    showAsanasModal,
    addAsanaToBlock,
    editingBlock,
    copyAsana,
    onChangeEditingBlock
  ])

  const addAsanasBlock = useCallback(() => {
    let nextEditingBlockId = '0'

    Object.keys(data).forEach((key) => {
      if (+key >= +nextEditingBlockId) {
        nextEditingBlockId = `${+key + 1}`
      }
    })

    onChangeEditingBlock(nextEditingBlockId)

    const newData = {
      ...data,
      [nextEditingBlockId]: []
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
    onChangeDescription('')
    onChangeEditingBlock('0')

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

    saveAs(blob, title)

    reachGoal('save_pdf')
  }, [pdfAsanaData, title])

  const onDuplicate = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault()

      onDuplicateProp()

      window.setTimeout(() => {
        window.open(
          `${window.location.origin}/${Urls.CREATE_SEQUENCE}`,
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
                placeholder="Введите название вашей последовательности..."
                label="Название последовательности"
                value={title}
                onChange={onTitleChange}
                name="title"
                errorMessage={
                  isInputEmpty ? 'Введите название последовательности' : ''
                }
              />
              <Textarea
                name="description"
                label="Описание последовательности"
                placeholder="Введите описание вашей последовательности..."
                className={styles.withTopMargin}
                value={description}
                onChange={onDescriptionChange}
              />

              <div className={styles.withTopMargin}>
                <Checkbox checked={isPublic} onChange={onCheckboxChange}>
                  Видна другим
                </Checkbox>
                <Tooltip title="Последовательность будет доступна для просмотра другим пользователям">
                  <QuestionCircleOutlined />
                </Tooltip>
              </div>
            </div>
          )}
          <div className={styles.sequenceBlocks}>{sequenceBlocks}</div>
          {!isViewMode && (
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
        (!!sequenceDuration.hours || !!sequenceDuration.minutes) && (
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
        {isAuthorized && (
          <Button
            size="large"
            href={Urls.CREATE_SEQUENCE}
            rel="noopener noreferrer"
            target="_blank"
            onClick={onDuplicate}>
            Дублировать последовательность
          </Button>
        )}
        <Button size="large" onClick={showPreview}>
          Посмотреть результат
        </Button>
        <Button size="large" onClick={generatePdf}>
          Скачать в PDF
        </Button>
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
