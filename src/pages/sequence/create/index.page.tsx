import React, {useCallback, useEffect, useMemo, useState} from 'react'

import styles from './styles.module.css'
import {AsanasList} from 'components/asanas-list'
import PdfViewer from 'components/pdf-viewer'
import {Asana} from 'types'
import {Button, Modal} from 'antd'
import {PDFDocument} from 'components/pdf-viewer/document'

import {saveAs} from 'file-saver'
import {pdf} from '@react-pdf/renderer'
import {Sequence} from 'components/sequence'
import {arrayMove} from '@dnd-kit/sortable'

import type {GetServerSideProps} from 'next/types'
import {Resizable} from 're-resizable'
import {Input} from 'components/input'
import {getAsanasList} from 'api/actions'
import {PageProps} from 'types/page-props'

import debounce from 'lodash.debounce'
import clsx from 'clsx'

interface BuilderData {
  asanas: {
    [key: string]: Asana
  }
  sequenceAsanaIds: string[]
}

const initialBuilderData: BuilderData = {
  asanas: {},
  sequenceAsanaIds: []
}

const CreateSequencePage: React.FC<PageProps> = ({
  isMobile,
  asanas: allAsanas = []
}) => {
  const [documentTitle, setDocumentTitle] = useState<string>('')
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)
  const [isAsanasModalVisible, setIsAsanasModalVisible] = useState(false)
  const [asanas, setAsanas] = useState(allAsanas)

  const [builderData, setBuilderData] =
    useState<BuilderData>(initialBuilderData)

  useEffect(() => {
    setAsanas(allAsanas)
  }, [allAsanas])

  // Удалить асану в редактируемой последовательности
  const deleteAsanaById = useCallback((asanaIndex: number): void => {
    setBuilderData((prevData) => ({
      ...prevData,
      sequenceAsanaIds: (prevData.sequenceAsanaIds ?? []).filter(
        (_, index) => index !== asanaIndex
      )
    }))
  }, [])

  // Очистить последовательность
  const clearSequence = useCallback(() => {
    setBuilderData(initialBuilderData)
    setDocumentTitle('')
  }, [])

  // Скрыть превью pdf файла
  const hidePreview = useCallback(() => setIsPdfModalVisible(false), [])

  // Показать превью pdf файла
  const showPreview = useCallback(() => setIsPdfModalVisible(true), [])

  // Скрыть превью pdf файла
  const hideAsanasModal = useCallback(() => setIsAsanasModalVisible(false), [])

  // Показать превью pdf файла
  const showAsanasModal = useCallback(() => setIsAsanasModalVisible(true), [])

  // Добавить асану в ряд последовательности
  const onAsanaClick = useCallback(
    ({id, ...restData}: Asana) => {
      setBuilderData((prevData) => ({
        asanas: {
          ...prevData.asanas,
          [`${id}`]: {
            id,
            ...restData
          }
        },
        sequenceAsanaIds: [...(prevData?.sequenceAsanaIds ?? []), `${id}`]
      }))

      if (isMobile) {
        hideAsanasModal()
      }
    },
    [hideAsanasModal, isMobile]
  )

  const pdfAsanaData = useMemo(() => {
    const {asanas, sequenceAsanaIds = []} = builderData

    return {
      documentTitle,
      asanas: sequenceAsanaIds.map((id) => asanas[id])
    }
  }, [builderData, documentTitle])

  // Сгенерировать pdf файл
  const generatePdf = useCallback(async () => {
    const pdfDoc = pdf(PDFDocument(pdfAsanaData))

    pdfDoc.updateContainer(PDFDocument(pdfAsanaData))

    const blob = await pdfDoc.toBlob()

    saveAs(blob, documentTitle)
  }, [pdfAsanaData, documentTitle])

  const onDragEnd = useCallback(
    (event: {active: {id: string}; over: {id?: string}}) => {
      const {active, over = {}} = event

      if (!!over.id && active.id !== over.id) {
        setBuilderData((prevData) => {
          const [, oldIndex] = active.id.split('-')
          const [, newIndex] = (over.id as string).split('-')

          const sortedIds = arrayMove(
            prevData.sequenceAsanaIds,
            +oldIndex,
            +newIndex
          )

          return {
            ...prevData,
            sequenceAsanaIds: sortedIds
          }
        })
      }
    },
    []
  )

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
  const sequenceData = useMemo(
    () =>
      (builderData.sequenceAsanaIds ?? []).map((id) => builderData.asanas[id]),
    [builderData]
  )

  return (
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
          <AsanasList
            onSearchAsana={onSearchAsana}
            isMobile={isMobile}
            asanas={asanas}
            onAsanaClick={onAsanaClick}
            size="small"
          />
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
            <div className={styles.sequences}>
              <Sequence
                data={sequenceData}
                isMobile={isMobile}
                onDeleteAsana={deleteAsanaById}
                onDragEnd={onDragEnd}
                onAddAsanaButtonClick={showAsanasModal}
              />
            </div>
          </div>
        </div>

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
          destroyOnClose
          footer={null}>
          <AsanasList
            onSearchAsana={onSearchAsana}
            isMobile={isMobile}
            asanas={asanas}
            onAsanaClick={onAsanaClick}
            size="small"
          />
        </Modal>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent']

  const isMobile = Boolean(
    UA?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  )

  const asanas = await getAsanasList()

  asanas.sort((a, b) => (a.name > b.name ? 1 : -1))

  return {props: {isMobile, asanas}}
}

export default CreateSequencePage
