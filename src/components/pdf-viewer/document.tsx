import React from 'react'
import {Page, Document, StyleSheet, Text, View, Font} from '@react-pdf/renderer'
import {Asana} from 'types'
import {createSVGPdfRendererComponent} from 'lib/svg-to-components'
import {iconsMap} from 'icons'

const styles = StyleSheet.create({
  page: {
    margin: 20,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    padding: 20
  },
  columnView: {
    display: 'flex',
    flexDirection: 'column'
  },
  rowView: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  documentTitle: {
    textAlign: 'center'
  }
})

Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAx05IsDqlA.ttf'
})

export interface Sequence {
  documentTitle?: string
  asanas: Asana[]
}

export const PDFDocument = ({documentTitle, asanas}: Sequence): any => {
  return (
    <Document>
      <Page orientation="landscape" style={styles.page}>
        <View style={styles.columnView}>
          {!!documentTitle && (
            <Text style={styles.documentTitle}>{documentTitle}</Text>
          )}
          <View style={styles.rowView}>
            {asanas.map(({alias = ''}: Asana) =>
              iconsMap[alias]
                ? createSVGPdfRendererComponent(iconsMap[alias])
                : undefined
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
