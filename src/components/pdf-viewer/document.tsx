import React from 'react'
import {
  Page,
  Document,
  StyleSheet,
  Image,
  Text,
  View
} from '@react-pdf/renderer'
import type {Sequence} from 'types'
import {imageSrc} from 'lib/image-src'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    margin: 20
  },
  image: {
    margin: 10,
    width: '70px',
    height: '70px'
  },
  text: {},
  view: {
    display: 'flex',
    flexDirection: 'column'
  },
  imagesView: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row'
  }
})

export const PDFDocument = ({asanas = [], title}: Sequence) => (
  <Document>
    <Page orientation="landscape" style={styles.page}>
      <View style={styles.view}>
        {!!title && <Text style={styles.text}>{title}</Text>}
        <View style={styles.imagesView}>
          {asanas.map((asana) => (
            <Image
              style={styles.image}
              src={imageSrc(asana.image)}
              key={asana.pk}
            />
          ))}
        </View>
      </View>
    </Page>
  </Document>
)
