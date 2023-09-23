import React from 'react'
import {Page, Document, StyleSheet, Image} from '@react-pdf/renderer'
import type {Asana} from 'types'
import {imageSrc} from 'lib/image-src'

const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    backgroundColor: '#fff'
  },
  image: {
    margin: 10,
    width: '70px',
    height: '70px'
  }
})

export const PDFDocument = (asanas: Asana[]) => (
  <Document>
    <Page
      orientation="landscape"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        backgroundColor: '#fff'
      }}>
      {(asanas || []).map((asana) => (
        <Image
          style={styles.image}
          src={imageSrc(asana.image)}
          key={asana.pk}
        />
      ))}
    </Page>
  </Document>
)
