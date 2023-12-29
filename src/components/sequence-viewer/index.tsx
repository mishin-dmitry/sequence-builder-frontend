import React, {useCallback, useMemo, useState} from 'react'

import {Button, Modal} from 'antd'
import {reachGoal} from 'lib/metrics'
import {PDFDocument} from 'components/pdf-viewer/document'
import {saveAs} from 'file-saver'
import {pdf} from '@react-pdf/renderer'
import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'
import {Urls} from 'lib/urls'
import {setItem} from 'lib/local-storage'
import {LOCAL_STORAGE_DUPLICATED_SEQUENCE_KEY} from 'lib/constants'

import type {Asana} from 'types'

import styles from './styles.module.css'
import PdfViewer from 'components/pdf-viewer'
import clsx from 'clsx'

interface SequenceViewerProps {
  data: Record<string, Asana[]>
  title: string
}

export const SequenceViewer: React.FC<SequenceViewerProps> = ({
  data,
  title
}) => {
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false)

  const {isDarkTheme, isMobile} = useSettings()
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
        <div className={styles.sequenceRow}>
          <div className={styles.sequence}>
            {data[key].map(
              (
                {id, alias, isAsanaInRepeatingBlock, isAsanaInDynamicBlock},
                index
              ) => {
                if (alias === 'separator' || alias === 'empty') return null

                return (
                  <div
                    className={clsx(
                      styles.imageWrapper,
                      isAsanaInRepeatingBlock &&
                        !isAsanaInDynamicBlock &&
                        styles.repeating,
                      !isAsanaInRepeatingBlock &&
                        isAsanaInDynamicBlock &&
                        styles.dynamic,
                      isAsanaInRepeatingBlock &&
                        isAsanaInDynamicBlock &&
                        styles.bothBlocks
                    )}
                    key={index}>
                    <img
                      width={70}
                      height={70}
                      key={id}
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(
                        iconsMap[alias].replaceAll(
                          '$COLOR',
                          isDarkTheme
                            ? 'rgba(255, 255, 255, 0.85)'
                            : 'rgba(0, 0, 0, 0.88)'
                        )
                      )}`}
                      alt="Изображение асаны"
                    />
                  </div>
                )
              }
            )}
          </div>
        </div>
      </div>
    ))
  }, [data, isDarkTheme])

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

  const duplicate = useCallback(
    (event: React.SyntheticEvent) => {
      event.preventDefault()

      setItem(LOCAL_STORAGE_DUPLICATED_SEQUENCE_KEY, data)

      window.setTimeout(() => {
        window.open(
          `${window.location.origin}${Urls.CREATE_SEQUENCE}`,
          '_blank'
        )
      }, 0)
    },
    [data]
  )

  return (
    <div className={styles.previewWrapper}>
      <div className={styles.scrollContainer}>
        <div className={styles.repeatRow}>
          <span />
          Повторить асану на другую сторону
        </div>
        <div className={styles.dynamicRow}>
          <span />
          Сделать асану в динамике
        </div>
        <div className={styles.sequenceBlocks}>{sequenceBlocks}</div>
      </div>

      <div className={styles.actionButtons}>
        <Button size="large" block={isMobile} onClick={duplicate}>
          Дублировать последовательность
        </Button>
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
        <PdfViewer sequence={pdfAsanaData} />
      </Modal>
    </div>
  )
}
