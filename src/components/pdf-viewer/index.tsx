import React from 'react'

import {PDFViewer, StyleSheet, Canvas} from '@react-pdf/renderer'
import dynamic from 'next/dynamic'

import styles from './styles.module.css'
import {PDFDocument, type Sequence} from './document'

interface PdfViewerProps {
  sequence: Sequence
}

const classes = StyleSheet.create({
  viewer: {
    width: '100%',
    height: '100%'
  }
})

const PdfViewer: React.FC<PdfViewerProps> = ({sequence}) => {
  return (
    <div className={styles.viewerWrapper}>
      <PDFViewer style={classes.viewer}>{PDFDocument(sequence)}</PDFViewer>
    </div>
  )
}

export default dynamic(() => Promise.resolve(PdfViewer), {
  ssr: false
})
