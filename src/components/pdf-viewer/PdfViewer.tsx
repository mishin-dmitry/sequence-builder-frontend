import React, {useEffect} from 'react'
import {PDFViewer} from '@react-pdf/renderer'
import styles from './styles.module.css'
import {PDFDocument} from './document'
import {PdfViewerProps, classes} from '.'

export const PdfViewer: React.FC<PdfViewerProps> = ({sequence}) => {
  const [_, updateInstance] = usePDF({document: PDFDocument})

  useEffect(() => {
    updateInstance(PDFDocument)
  }, [sequence, updateInstance])

  return (
    <div className={styles.viewerWrapper}>
      <PDFViewer style={classes.viewer}>{PDFDocument(sequence)}</PDFViewer>
    </div>
  )
}
