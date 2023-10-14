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

export const PDFDocument = ({
  documentTitle,
  asanas: asanasProp
}: Sequence): any => {
  const asanas = asanasProp.reduce((acc: (Asana | Asana[])[], curValue) => {
    const lastElement: Asana[] | Asana | null = acc.length
      ? acc[acc.length - 1]
      : null

    if (Array.isArray(lastElement) && curValue.isAsanaInRepeatingBlock) {
      if (lastElement.length > 9) {
        acc.push([curValue])

        return acc
      }

      lastElement.push(curValue)

      return acc
    }

    if (!curValue.isAsanaInRepeatingBlock) {
      acc.push(curValue)
    } else {
      acc.push([curValue])
    }

    return acc
  }, [])

  return (
    <Document>
      <Page orientation="landscape" style={styles.page}>
        <View style={styles.columnView}>
          {!!documentTitle && (
            <Text style={styles.documentTitle}>{documentTitle}</Text>
          )}
          <View style={styles.rowView}>
            {asanas.map((asana: Asana | Asana[], index) => {
              if (Array.isArray(asana)) {
                return (
                  <View
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                    <View
                      style={{
                        borderBottom: '2px solid black',
                        paddingBottom: 5,
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap'
                      }}>
                      {asana.map(({alias}) =>
                        iconsMap[alias]
                          ? createSVGPdfRendererComponent(iconsMap[alias])
                          : undefined
                      )}
                    </View>
                    <Text style={{fontSize: 10}}>Смена сторон</Text>
                  </View>
                )
              } else {
                return iconsMap[asana.alias]
                  ? createSVGPdfRendererComponent(iconsMap[asana.alias])
                  : undefined
              }
            })}
          </View>
        </View>
      </Page>
    </Document>
  )
}
