import React from 'react'

import {StyleSheet, PDFViewer} from '@react-pdf/renderer'
import dynamic from 'next/dynamic'

import styles from './styles.module.css'
import {PDFDocument, type Sequence} from './document'

const classes = StyleSheet.create({
  section: {
    flexGrow: 1
  },
  image: {
    margin: 10,
    width: '70px',
    height: '70px'
  },
  viewer: {
    width: '841.89px',
    height: '595.28px'
  }
})

interface PdfViewerProps {
  sequence: Sequence
}

const PdfViewer: React.FC<PdfViewerProps> = ({sequence}) => {
  return (
    <div className={styles.viewerWrapper}>
      <PDFViewer style={classes.viewer} showToolbar={false}>
        {PDFDocument(sequence)}
      </PDFViewer>
    </div>
  )
}

export default dynamic(() => Promise.resolve(PdfViewer), {
  ssr: false
})
