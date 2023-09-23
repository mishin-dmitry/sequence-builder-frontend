import React from 'react'

import {StyleSheet, PDFViewer} from '@react-pdf/renderer'
import dynamic from 'next/dynamic'

import styles from './styles.module.css'
import {Asana} from 'types'
import {PDFDocument} from './document'

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
  asanas: Asana[]
}

const PdfViewer: React.FC<PdfViewerProps> = ({asanas}) => {
  return (
    <div className={styles.viewerWrapper}>
      <PDFViewer style={classes.viewer} showToolbar={false}>
        {PDFDocument(asanas)}
      </PDFViewer>
    </div>
  )
}

export default dynamic(() => Promise.resolve(PdfViewer), {
  ssr: false
})
