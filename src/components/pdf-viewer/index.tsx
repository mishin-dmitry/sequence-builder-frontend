import React from 'react'

import {PDFViewer, StyleSheet} from '@react-pdf/renderer'
import dynamic from 'next/dynamic'

import styles from './styles.module.css'
import {PDFDocument, type Sequence} from './document'
import clsx from 'clsx'

interface PdfViewerProps {
  sequence: Sequence
  isMobile: boolean
}

const classes = StyleSheet.create({
  viewer: {
    width: '100%',
    height: '100%'
  }
})

const PdfViewer: React.FC<PdfViewerProps> = ({sequence, isMobile}) => {
  return (
    <div className={clsx(styles.viewerWrapper, isMobile && styles.mobile)}>
      <PDFViewer style={classes.viewer}>{PDFDocument(sequence)}</PDFViewer>
    </div>
  )
}

export default dynamic(() => Promise.resolve(PdfViewer), {
  ssr: false
})
