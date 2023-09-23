import React, {useCallback, useMemo, useState} from 'react'

import styles from './styles.module.css'
import {Spinner} from 'components/spinner'
import {useAsana} from 'context/asanas'
import {AsanaCardsList} from 'components/asanas-cards-list'
import PdfViewer from 'components/pdf-viewer'
import {Asana} from 'types'
import {imageSrc} from 'lib/image-src'
import {Button, Modal} from 'antd'
import {CloseOutlined} from '@ant-design/icons'
import {PDFDocument} from 'components/pdf-viewer/document'

import {saveAs} from 'file-saver'
import {pdf} from '@react-pdf/renderer'

const CreateSequencePage: React.FC = () => {
  const [chosenAsanas, setChosenAsanas] = useState<Asana[]>([])
  const [isModelVisible, setIsModelVisible] = useState(false)
  const {isFetching, asanas} = useAsana()

  const onAsanaClick = useCallback((asana: Asana) => {
    setChosenAsanas((prevState) => [...prevState, asana])
  }, [])

  const deleteAsanaById = (id: number): void => {
    setChosenAsanas((prevState) => prevState.filter((_, index) => id !== index))
  }

  const clearChosenAsanas = useCallback(() => setChosenAsanas([]), [])

  const showPreview = useCallback(() => setIsModelVisible(true), [])
  const hidePreview = useCallback(() => setIsModelVisible(false), [])

  const currentSequence = useMemo(() => {
    return (chosenAsanas ?? []).map(({pk, image}, index) => (
      <div className={styles.imageWrapper}>
        <img
          width={70}
          height={70}
          className={styles.image}
          key={pk}
          src={imageSrc(image)}
        />
        <Button
          shape="circle"
          type="primary"
          size="small"
          danger
          icon={<CloseOutlined />}
          className={styles.deleteButton}
          onClick={() => deleteAsanaById(index)}
        />
      </div>
    ))
  }, [chosenAsanas])

  const generatePdf = useCallback(async () => {
    const pdfDoc = pdf(PDFDocument(chosenAsanas))

    pdfDoc.updateContainer(PDFDocument(chosenAsanas))

    const blob = await pdfDoc.toBlob()

    saveAs(blob, 'test')
  }, [chosenAsanas])

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
        />
      </div>
      <div className={styles.previewWrapper}>
        <div className={styles.sequenceEditor}>{currentSequence}</div>
        <div className={styles.actionButtons}>
          <Button
            type="primary"
            size="large"
            danger
            disabled={!chosenAsanas.length}
            onClick={clearChosenAsanas}>
            Очистить
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={showPreview}
            disabled={!chosenAsanas.length}>
            Посмотреть результат
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={generatePdf}
            disabled={!chosenAsanas.length}>
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
          <PdfViewer asanas={chosenAsanas} />
        </Modal>
      </div>
    </div>
  )
}

export default CreateSequencePage
