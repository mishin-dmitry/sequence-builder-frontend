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

import debounce from 'lodash.debounce'
import clsx from 'clsx'
import {SearchFilter} from 'components/serch-filter'

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
  asanas: allAsanas = [],
  asanaGroups = []
}) => {
  const [documentTitle, setDocumentTitle] = useState<string>('')
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)
  const [isAsanasModalVisible, setIsAsanasModalVisible] = useState(false)
  const [asanas, setAsanas] = useState(allAsanas)

  const searchAsanaString = useRef<string>('')
  const filterAsanaGroups = useRef<AsanaGroup[]>([])

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
    ({id, ...restData}: Asana) => {
      setBuilderData((prevData) => {
        const newData = {
          asanas: {
            ...prevData.asanas,
            [`${id}`]: {
              id,
              ...restData
            }
          },
          sequenceAsanaIds: [...(prevData?.sequenceAsanaIds ?? []), `${id}`]
        }

        return newData
      })

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

    reachGoal('save_pdf')
  }, [pdfAsanaData, documentTitle])

  const onDragEnd = useCallback(
    (event: {active: {id: string}; over: {id?: string}}) => {
      const {active, over} = event

      if (!!over?.id && active.id !== over.id) {
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
    debounce((event: React.ChangeEvent<HTMLInputElement> | string) => {
      const value = typeof event === 'string' ? event : event.target.value

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
  const sequenceData = useMemo(
    () =>
      (builderData.sequenceAsanaIds ?? []).map((id) => builderData.asanas[id]),
    [builderData]
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
    [allAsanas, asanas]
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
            <div className={styles.listWrapper}>
              <SearchFilter
                onSearchAsana={onSearchAsana}
                filterItems={asanaGroups}
                onFilterAsanas={onFilterAsana}
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

  const asanas = await getAsanasList()
  const asanaGroups = await getAsanaGroupsList()

  asanas.sort((a, b) => (a.name > b.name ? 1 : -1))
  asanaGroups.sort((a, b) => (a.name > b.name ? 1 : -1))

  return {props: {isMobile, asanas, asanaGroups}}
}

export default CreateSequencePage
