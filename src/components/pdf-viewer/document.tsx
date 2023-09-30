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
  image: {
    margin: 5,
    width: '80px',
    height: '80px'
  },
  text: {},
  columnView: {
    display: 'flex',
    flexDirection: 'column'
  },
  rowView: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row'
  },
  rowTitle: {
    fontSize: 12
  },
  documentTitle: {
    textAlign: 'center'
  }
})

Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAx05IsDqlA.ttf'
})

interface Row {
  title?: string
  asanas: Asana[]
}

export interface Sequence {
  documentTitle?: string
  rows: Row[]
}

export const PDFDocument = ({rows, documentTitle}: Sequence): any => {
  return (
    <Document>
      <Page orientation="landscape" style={styles.page}>
        <View style={styles.columnView}>
          {!!documentTitle && (
            <Text style={styles.documentTitle}>{documentTitle}</Text>
          )}
          <View>
            {rows.map(({title, asanas}, index) => (
              <View key={index} style={styles.columnView}>
                <Text style={styles.rowTitle}>{title}</Text>
                <View style={styles.rowView}>
                  {asanas.map(({alias = ''}: Asana) =>
                    iconsMap[alias]
                      ? createSVGPdfRendererComponent(iconsMap[alias])
                      : undefined
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}
