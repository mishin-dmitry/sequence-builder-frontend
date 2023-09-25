import React, {useCallback, useMemo, useState} from 'react'

import styles from './styles.module.css'
import {Spinner} from 'components/spinner'
import {useAsana} from 'context/asanas'
import {AsanaCardsList} from 'components/asanas-cards-list'
import PdfViewer from 'components/pdf-viewer'
import {Asana} from 'types'
import {Button, Modal} from 'antd'
import {PDFDocument} from 'components/pdf-viewer/document'

import {saveAs} from 'file-saver'
import {pdf} from '@react-pdf/renderer'
import {SequenceRow} from 'components/sequence-row'
import {
  DragDropContext,
  resetServerContext,
  type DropResult
} from 'react-beautiful-dnd'
import type {GetServerSideProps} from 'next/types'

interface Sequence {
  title?: string
  asanas: Asana[]
}

const initialSequence: Sequence = {
  title: '',
  asanas: []
}

interface BuilderData {
  asanas: {
    [key: string]: Asana
  }
  sequences: {
    [key: string]: {
      id: string
      title: string
      asanaIds: string[]
    }
  }
  sequenceOrder: string[]
}

const initialBuilderData: BuilderData = {
  asanas: {},
  sequences: {},
  sequenceOrder: []
}

const MAX_SEQUENCE_COUNT = 5

const CreateSequencePage: React.FC = () => {
  const [editingSequence, setEditingSequence] = useState<string>('')

  const [builderData, setBuilderData] =
    useState<BuilderData>(initialBuilderData)

  const [sequence, setSequence] = useState<Sequence>(initialSequence)
  const [isModelVisible, setIsModelVisible] = useState(false)
  const {isFetching, asanas} = useAsana()

  const sequencesCount = useMemo(
    () => Object.keys(builderData.sequences).length,
    [builderData.sequences]
  )

  const onAsanaClick = useCallback(
    ({pk, ...restData}: Asana) => {
      setBuilderData((prevData) => {
        const prevBuilderSequences = prevData.sequences[editingSequence]

        const newBuilderData: BuilderData = {
          asanas: {
            ...prevData.asanas,
            [`asana-${pk}`]: {
              pk,
              ...restData
            }
          },
          sequences: {
            ...prevData.sequences,
            [editingSequence]: {
              ...prevBuilderSequences,
              asanaIds: [
                ...(prevBuilderSequences?.asanaIds ?? []),
                `asana-${pk}`
              ]
            }
          },
          sequenceOrder: [...prevData.sequenceOrder]
        }

        return newBuilderData
      })
    },
    [editingSequence]
  )

  const deleteAsanaById = useCallback((id: number): void => {
    setSequence(({title, asanas}) => ({
      title,
      asanas: asanas.filter((_, index) => id !== index)
    }))
  }, [])

  const clearSequence = useCallback(() => setSequence(initialSequence), [])

  const showPreview = useCallback(() => setIsModelVisible(true), [])
  const hidePreview = useCallback(() => setIsModelVisible(false), [])

  const generatePdf = useCallback(async () => {
    const pdfDoc = pdf(PDFDocument(sequence))

    pdfDoc.updateContainer(PDFDocument(sequence))

    const blob = await pdfDoc.toBlob()

    saveAs(blob, 'test')
  }, [sequence])

  const onSequenceTitleChange = useCallback((title: string) => {
    setSequence(({asanas}) => ({asanas, title}))
  }, [])

  const onAddSequence = useCallback(() => {
    const newSequenceCount = sequencesCount + 1
    const newSequenceId = `sequence-${newSequenceCount}`

    setBuilderData((prevBuildData) => {
      const newBuilderData: BuilderData = {
        ...prevBuildData,
        sequences: {
          ...prevBuildData.sequences,
          [newSequenceId]: {
            id: newSequenceId,
            title: '',
            asanaIds: []
          }
        },
        sequenceOrder: [...prevBuildData.sequenceOrder, newSequenceId]
      }

      return newBuilderData
    })

    if (!sequencesCount) {
      setEditingSequence(newSequenceId)
    }
  }, [sequencesCount])

  const onDragStart = useCallback((data: any) => {
    console.log('start', data)
  }, [])

  const onDragUpdate = useCallback((data: any) => {
    console.log('update', data)
  }, [])

  const onDragEnd = useCallback(
    ({source, destination, draggableId}: DropResult) => {
      if (!destination) {
        return
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return
      }

      // Так как id для draggable должен быть уникальным
      // для каждый асаны в id мы добавляем index,
      // но здесь нам index не нужен, поэтому уберем его
      const [prefix, pk] = draggableId.split('-')

      draggableId = `${prefix}-${pk}`

      const sequence = builderData.sequences[source.droppableId]
      const newAsanasIds = [...sequence.asanaIds]

      newAsanasIds.splice(source.index, 1)
      newAsanasIds.splice(destination.index, 0, draggableId)

      const newSequence = {
        ...sequence,
        asanaIds: newAsanasIds
      }

      const newBuilderData = {
        ...builderData,
        sequences: {
          ...builderData.sequences,
          [newSequence.id]: newSequence
        }
      }

      setBuilderData(newBuilderData)
    },
    [builderData]
  )

  const onSequenceRowClick = useCallback(setEditingSequence, [])

  const sequences = useMemo(() => {
    return builderData.sequenceOrder.map((sequenceId) => {
      const currentSequence = builderData.sequences[sequenceId]

      const data = (currentSequence?.asanaIds ?? []).map(
        (id) => builderData.asanas[id]
      )

      return (
        <DragDropContext
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onDragUpdate={onDragUpdate}
          key={sequenceId}>
          <SequenceRow
            data={data}
            onDelete={deleteAsanaById}
            onChange={onSequenceTitleChange}
            id={sequenceId}
            isEditing={sequenceId === editingSequence}
            onClick={onSequenceRowClick}
          />
        </DragDropContext>
      )
    })
  }, [
    builderData.sequenceOrder,
    builderData.sequences,
    builderData.asanas,
    onDragEnd,
    onDragStart,
    onDragUpdate,
    deleteAsanaById,
    onSequenceTitleChange,
    editingSequence,
    onSequenceRowClick
  ])

  if (isFetching) {
    return <Spinner />
  }

  return (
    <div className={styles.root}>
      <div className={styles.listWrapper}>
        <AsanaCardsList
          asanas={asanas}
          className={styles.list}
          onAsanaClick={onAsanaClick}
          size="small"
        />
      </div>
      <div className={styles.previewWrapper}>
        <div className={styles.sequences}>
          {sequences}
          {sequencesCount < MAX_SEQUENCE_COUNT && (
            <Button
              type="default"
              size="large"
              className={styles.button}
              block
              onClick={onAddSequence}>
              Добавить ряд
            </Button>
          )}
        </div>

        <div className={styles.actionButtons}>
          <Button
            type="primary"
            size="large"
            danger
            disabled={!sequence.asanas.length}
            onClick={clearSequence}>
            Очистить
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={showPreview}
            disabled={!sequence.asanas.length}>
            Посмотреть результат
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={generatePdf}
            disabled={!sequence.asanas.length}>
            Сохранить
          </Button>
        </div>
        <Modal
          title="Ваша последовательность"
          centered
          okText="Скачать"
          cancelText="Отмена"
          open={isModelVisible}
          onOk={generatePdf}
          onCancel={hidePreview}
          width={1000}>
          <PdfViewer sequence={sequence} />
        </Modal>
      </div>
    </div>
  )
}

export default CreateSequencePage

export const getServerSideProps: GetServerSideProps = async () => {
  // reset dnd context to prevent didn't match error
  resetServerContext()

  return {props: {data: []}}
}
