import React, {useCallback, useMemo, useState} from 'react'

import {Button, Modal} from 'antd'
import {reachGoal} from 'lib/metrics'
import {PDFDocument} from 'components/pdf-viewer/document'
import {saveAs} from 'file-saver'
import {pdf} from '@react-pdf/renderer'
import {iconsMap} from 'icons'

import type {Asana} from 'types'

import styles from './styles.module.css'
import PdfViewer from 'components/pdf-viewer'
import clsx from 'clsx'

interface SequenceViewerProps {
  isMobile: boolean
  data: Record<string, Asana[]>
  title: string
}

export const SequenceViewer: React.FC<SequenceViewerProps> = ({
  isMobile,
  data,
  title
}) => {
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)

  // Скрыть превью pdf файла
  const hidePreview = useCallback(() => setIsPdfModalVisible(false), [])

  // Показать превью pdf файла
  const showPreview = useCallback(() => {
    setIsPdfModalVisible(true)

    reachGoal('show_preview')
  }, [])

  const sequenceBlocks = useMemo(() => {
    return Object.keys(data).map((key, index) => (
      <div key={index} className={styles.blockWrapper}>
        <div className={clsx(styles.sequenceRow, isMobile && styles.mobile)}>
          <div className={styles.sequence}>
            {data[key].map(({id, alias, isAsanaInRepeatingBlock}, index) => (
              <div
                className={clsx(
                  styles.imageWrapper,
                  isAsanaInRepeatingBlock && styles.repeating
                )}
                key={index}>
                <img
                  width={70}
                  height={70}
                  key={id}
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(
                    iconsMap[alias]
                  )}`}
                  alt="Изображение асаны"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    ))
  }, [data, isMobile])

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

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.scrollContainer}>
        <div className={styles.sequenceBlocks}>{sequenceBlocks}</div>
      </div>

      <div className={styles.actionButtons}>
        <Button size="large" block={isMobile} onClick={showPreview}>
          Посмотреть PDF
        </Button>
        <Button size="large" block={isMobile} onClick={generatePdf}>
          Скачать в PDF
        </Button>
      </div>
      <Modal
        title="Последовательность"
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
    </div>
  )
}