import React, {useCallback, useState} from 'react'

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

interface Sequence {
  title?: string
  asanas: Asana[]
}

const initialSequence: Sequence = {
  title: '',
  asanas: []
}

const CreateSequencePage: React.FC = () => {
  const [sequence, setSequence] = useState<Sequence>(initialSequence)
  const [isModelVisible, setIsModelVisible] = useState(false)
  const {isFetching, asanas} = useAsana()

  const onAsanaClick = useCallback((asana: Asana) => {
    setSequence(({title, asanas}) => ({
      title,
      asanas: [...asanas, asana]
    }))
  }, [])

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
          <SequenceRow
            data={sequence.asanas}
            onDelete={deleteAsanaById}
            onChange={onSequenceTitleChange}
          />
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
