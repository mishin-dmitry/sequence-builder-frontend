import React from 'react'
import {
  Page,
  Document,
  StyleSheet,
  Image,
  Text,
  View,
  Font
} from '@react-pdf/renderer'
import {imageSrc} from 'lib/image-src'
import {Asana} from 'types'

const styles = StyleSheet.create({
  page: {
    margin: 20,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    padding: 20
  },
  image: {
    margin: 5,
    width: '50px',
    height: '50px'
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
  src: 'http://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9vAx05IsDqlA.ttf'
})

interface Row {
  title?: string
  asanas: Asana[]
}

export interface Sequence {
  documentTitle?: string
  rows: Row[]
}

export const PDFDocument = ({rows, documentTitle}: Sequence): any => (
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
                {asanas.map((asana: Asana) => (
                  <Image
                    style={styles.image}
                    src={imageSrc(asana.image)}
                    key={asana.id}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
)
