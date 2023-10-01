import React, {useCallback, useEffect, useMemo, useState} from 'react'

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
  type DropResult,
  Droppable,
  DragStart
} from 'react-beautiful-dnd'

import type {GetServerSideProps} from 'next/types'
import {Resizable} from 're-resizable'
import {Input} from 'components/input'

import debounce from 'lodash.debounce'
import {isMobile as _isMobile} from 'lib/is-mobile'
import clsx from 'clsx'

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
  sequences: {
    'sequence-1': {
      id: 'sequence-1',
      title: '',
      asanaIds: []
    }
  },
  sequenceOrder: ['sequence-1']
}

const MAX_SEQUENCE_COUNT = 5

const CreateSequencePage: React.FC = () => {
  const [editingSequence, setEditingSequence] = useState<string>('sequence-1')
  const [documentTitle, setDocumentTitle] = useState<string>('')

  const [builderData, setBuilderData] =
    useState<BuilderData>(initialBuilderData)

  const [isModelVisible, setIsModelVisible] = useState(false)
  const {isFetching, asanas: allAsanas} = useAsana()

  const [asanas, setAsanas] = useState(allAsanas)

  useEffect(() => {
    setAsanas(allAsanas)
  }, [allAsanas])

  const sequencesCount = useMemo(
    () => Object.keys(builderData.sequences).length,
    [builderData]
  )

  // Добавить асану в ряд последовательности
  const onAsanaClick = useCallback(
    ({id, ...restData}: Asana) => {
      setBuilderData((prevData) => {
        const prevBuilderSequences = prevData.sequences[editingSequence]

        return {
          asanas: {
            ...prevData.asanas,
            [`asana-${id}`]: {
              id,
              ...restData
            }
          },
          sequences: {
            ...prevData.sequences,
            [editingSequence]: {
              ...prevBuilderSequences,
              asanaIds: [
                ...(prevBuilderSequences?.asanaIds ?? []),
                `asana-${id}`
              ]
            }
          },
          sequenceOrder: [...prevData.sequenceOrder]
        }
      })
    },
    [editingSequence]
  )

  // Удалить асану в редактируемой последовательности
  const deleteAsanaById = useCallback(
    (id: number): void => {
      setBuilderData((prevData) => {
        const prevBuilderSequences = prevData.sequences[editingSequence]

        return {
          ...prevData,
          sequences: {
            ...prevData.sequences,
            [editingSequence]: {
              ...prevBuilderSequences,
              asanaIds: (prevBuilderSequences?.asanaIds ?? []).filter(
                (_, index) => id !== index
              )
            }
          },
          sequenceOrder: [...prevData.sequenceOrder]
        }
      })
    },
    [editingSequence]
  )

  // Очистить последовательность
  const clearSequence = useCallback(() => {
    setBuilderData(initialBuilderData)
    setDocumentTitle('')
  }, [])

  // Скрыть превью pdf файла
  const hidePreview = useCallback(() => setIsModelVisible(false), [])

  // Показать превью pdf файла
  const showPreview = useCallback(() => setIsModelVisible(true), [])

  const pdfAsanaData = useMemo(() => {
    const {sequences, asanas, sequenceOrder} = builderData

    return {
      documentTitle,
      rows: sequenceOrder.map((sequenceId) => ({
        title: sequences[sequenceId]?.title,
        asanas: (sequences[sequenceId]?.asanaIds ?? []).map((id) => asanas[id])
      }))
    }
  }, [builderData, documentTitle])

  // Сгенерировать pdf файл
  const generatePdf = useCallback(async () => {
    const pdfDoc = pdf(PDFDocument(pdfAsanaData))

    pdfDoc.updateContainer(PDFDocument(pdfAsanaData))

    const blob = await pdfDoc.toBlob()

    saveAs(blob, documentTitle)
  }, [pdfAsanaData, documentTitle])

  // Изменить заголовок ряда последовательности
  const onSequenceRowTitleChange = useCallback(
    (title: string) => {
      setBuilderData((prevData) => {
        const prevBuilderSequences = prevData.sequences[editingSequence]

        const newBuilderData: BuilderData = {
          ...prevData,
          sequences: {
            ...prevData.sequences,
            [editingSequence]: {
              ...prevBuilderSequences,
              title
            }
          },
          sequenceOrder: [...prevData.sequenceOrder]
        }

        return newBuilderData
      })
    },
    [editingSequence]
  )

  const getNextSequenceId = useCallback((sequenceIds: string[]) => {
    let maxId = 0

    sequenceIds.forEach((id) => {
      const [, currentId] = id.split('-')

      const currentIdNumber = +currentId

      if (currentIdNumber > maxId) {
        maxId = currentIdNumber
      }
    })

    return `sequence-${maxId + 1}`
  }, [])

  const onAddSequence = useCallback(() => {
    const newSequenceId = getNextSequenceId(builderData.sequenceOrder)

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

    setEditingSequence(newSequenceId)
  }, [getNextSequenceId, builderData.sequenceOrder])

  const onDragStart = useCallback(
    ({source}: DragStart) => {
      // Если начали тащить асану из другого блока и он неактивен,
      // то поменяем редактируемые блок асан
      if (source.droppableId !== editingSequence) {
        setEditingSequence(source.droppableId)
      }
    },
    [editingSequence]
  )

  const onDragEnd = useCallback(
    ({source, destination, draggableId, type}: DropResult) => {
      if (!destination) {
        return
      }

      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return
      }

      if (type === 'rows') {
        setBuilderData((prevData) => {
          const newSequencesOrder = [...prevData.sequenceOrder]

          newSequencesOrder.splice(source.index, 1)
          newSequencesOrder.splice(destination.index, 0, draggableId)

          return {
            ...prevData,
            sequences: JSON.parse(JSON.stringify(prevData.sequences)),
            sequenceOrder: newSequencesOrder
          }
        })

        return
      }

      setBuilderData((prevData) => {
        const [prefix, id] = draggableId.split('-')

        draggableId = `${prefix}-${id}`

        const sequence = prevData.sequences[source.droppableId]
        const newAsanasIds = [...sequence.asanaIds]

        newAsanasIds.splice(source.index, 1)
        newAsanasIds.splice(destination.index, 0, draggableId)

        const newSequence = {
          ...sequence,
          asanaIds: newAsanasIds
        }

        return {
          ...prevData,
          sequences: {
            ...prevData.sequences,
            [newSequence.id]: {
              ...sequence,
              asanaIds: newAsanasIds
            }
          }
        }
      })
    },
    []
  )

  const onSequenceRowClick = useCallback(setEditingSequence, [
    setEditingSequence
  ])

  const onSequenceRowDoubleClick = useCallback(
    (id: string) => {
      setBuilderData((prevData) => {
        const filteredData = {
          ...prevData,
          sequenceOrder: prevData.sequenceOrder.filter(
            (sequenceId) => sequenceId !== id
          )
        }

        delete filteredData.sequences[id]

        return filteredData
      })

      const lastBuilderSequenceId = (builderData.sequenceOrder ?? [])[
        builderData.sequenceOrder.length - 1
      ]

      setEditingSequence(lastBuilderSequenceId)
    },
    [builderData]
  )

  const sequences = useMemo(() => {
    return builderData.sequenceOrder.map((sequenceId, index) => {
      const currentSequence = builderData.sequences[sequenceId] ?? {}

      const data = (currentSequence?.asanaIds ?? []).map(
        (id) => builderData.asanas[id]
      )

      return (
        <SequenceRow
          data={data}
          onDeleteAsana={deleteAsanaById}
          onChange={onSequenceRowTitleChange}
          id={sequenceId}
          isEditing={sequenceId === editingSequence}
          onClick={onSequenceRowClick}
          onDeleteSequence={onSequenceRowDoubleClick}
          key={index}
          index={index}
          title={currentSequence.title}
        />
      )
    })
  }, [
    builderData,
    deleteAsanaById,
    onSequenceRowTitleChange,
    editingSequence,
    onSequenceRowClick,
    onSequenceRowDoubleClick
  ])

  const onSearchAsana = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      const {value} = event.target

      const filteredAsanas = value
        ? allAsanas.filter(({name, searchKeys}) => {
            const parsedSearchKeys = searchKeys?.split(',') ?? []

            return (
              name.toLowerCase().includes(value.toLowerCase()) ||
              parsedSearchKeys.some((key: string) =>
                key.toLowerCase().includes(value.toLowerCase())
              )
            )
          })
        : allAsanas

      setAsanas(filteredAsanas)
    }, 200),
    [allAsanas]
  )

  const onDocumentTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDocumentTitle(event.target.value)
    },
    []
  )

  const asanasList = useMemo(
    () => (
      <div className={styles.listWrapper}>
        <div className={styles.searchWrapper}>
          <Input
            name="search"
            placeholder="Найти асану..."
            allowClear
            onChange={onSearchAsana}
          />
        </div>
        <AsanaCardsList
          asanas={asanas}
          className={styles.list}
          onAsanaClick={onAsanaClick}
          size="small"
        />
      </div>
    ),
    [asanas, onAsanaClick, onSearchAsana]
  )

  const isMobile = _isMobile()

  if (isFetching) {
    return <Spinner />
  }

  return (
    <div className={clsx(styles.root, isMobile && styles.mobile)}>
      {isMobile ? (
        asanasList
      ) : (
        <Resizable
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #ddd'
          }}
          defaultSize={{
            width: '335px',
            height: '100%'
          }}
          maxWidth="505px"
          minWidth="160px">
          {asanasList}
        </Resizable>
      )}
      <div className={styles.previewWrapper}>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <div className={styles.scrollContainer}>
            <div className={styles.scrollContainerInner}>
              <Input
                placeholder="Введите название вашей последовательности..."
                label="Название последовательности"
                value={documentTitle}
                onChange={onDocumentTitleChange}
                name="documentTitle"
              />
              <Droppable droppableId="allRows" type="rows">
                {({innerRef, droppableProps, placeholder}) => (
                  <div
                    className={styles.sequences}
                    ref={innerRef}
                    {...droppableProps}>
                    {sequences}
                    {placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            {sequencesCount < MAX_SEQUENCE_COUNT && (
              <Button
                type="default"
                size="large"
                className={styles.button}
                block
                onClick={onAddSequence}>
                Добавить блок
              </Button>
            )}
          </div>
        </DragDropContext>

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
          destroyOnClose
          width={1000}
          {...(isMobile ? {footer: null} : {})}>
          <PdfViewer sequence={pdfAsanaData} />
        </Modal>
      </div>
    </div>
  )
}

export default CreateSequencePage

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent']

  const isMobile = Boolean(
    UA?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  )

  // reset dnd context to prevent didn't match error
  resetServerContext()

  return {props: {data: [], isMobile}}
}
