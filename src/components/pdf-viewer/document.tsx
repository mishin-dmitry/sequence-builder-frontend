import React from 'react'

import {
  Page,
  Document,
  StyleSheet,
  Text,
  View,
  Font,
  Svg
} from '@react-pdf/renderer'

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
    flexDirection: 'row',
    marginTop: 5
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
  asanas: Record<string, Asana[]>
}
interface Accumulator {
  asanas: (Asana | Asana[])[]
  block?: 'repeat' | 'dynamic'
}

export const PDFDocument = ({asanas: asanasProp}: Sequence): any => {
  const prepareAsanasBlock = (asanas: Asana[]): (Asana | Asana[])[] => {
    return asanas.reduce(
      (acc: Accumulator, curValue) => {
        // Если последний элемент в аккумуляторе массив, то будем пушить в него
        const lastElement: any = acc.asanas.length
          ? acc.asanas[acc.asanas.length - 1]
          : null

        const hasOnlyRepeatingBlock =
          curValue.isAsanaInRepeatingBlock && !curValue.isAsanaInDynamicBlock

        const hasOnlyDynamicBlock =
          curValue.isAsanaInDynamicBlock && !curValue.isAsanaInRepeatingBlock

        if (
          Array.isArray(lastElement) &&
          (hasOnlyRepeatingBlock || hasOnlyDynamicBlock)
        ) {
          // Если массив совпадает с текущим блоком, то просто пушнем в него
          if (
            (curValue.isAsanaInRepeatingBlock && acc.block === 'repeat') ||
            (curValue.isAsanaInDynamicBlock && acc.block === 'dynamic')
          ) {
            lastElement.push(curValue)
            // Если не совпадает с текущим блоком, обновим блок и пушнем новый массив
          } else {
            acc.block = curValue.isAsanaInRepeatingBlock ? 'repeat' : 'dynamic'

            acc.asanas.push([curValue])
          }

          return acc
        }

        // Если асаны нет в блоках
        if (
          !curValue.isAsanaInRepeatingBlock &&
          !curValue.isAsanaInDynamicBlock
        ) {
          if (acc.block) {
            acc.block = undefined
          }

          acc.asanas.push(curValue)

          // Если асана только в блоке с повторением
        } else if (hasOnlyRepeatingBlock) {
          acc.block = 'repeat'

          acc.asanas.push([curValue])

          // Если асана только в блоке с  динамикой
        } else if (hasOnlyDynamicBlock) {
          acc.block = 'dynamic'

          acc.asanas.push([curValue])

          // Если асана в обоих блоках
        } else {
          const isMatrix =
            Array.isArray(lastElement) && Array.isArray(lastElement[0])

          if (isMatrix) {
            lastElement[0].push(curValue)
          } else {
            acc.asanas.push([[curValue]] as any)
          }
        }

        return acc
      },
      {asanas: []}
    ).asanas
  }

  const renderSvg = ({alias}: Asana, index: number): any => {
    if (alias === 'empty') {
      return <Svg width={70} height={70} key={index} />
    } else if (alias === 'separator') {
      return <Svg width={10} height={70} key={index} />
    } else {
      return iconsMap[alias]
        ? createSVGPdfRendererComponent(iconsMap[alias])
        : undefined
    }
  }

  return (
    <Document>
      <Page orientation="landscape" style={styles.page}>
        <View style={styles.columnView}>
          {Object.values(asanasProp).map((asanasBlock, index) => {
            const asanas = prepareAsanasBlock(asanasBlock)

            return (
              <View style={styles.rowView} key={index}>
                {asanas.map((asana: Asana | Asana[], index) => {
                  if (Array.isArray(asana)) {
                    const isDynamicBlock = asana.every(
                      ({isAsanaInDynamicBlock}) => isAsanaInDynamicBlock
                    )

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
                          {asana.map((_asana, index) => {
                            if (Array.isArray(_asana)) {
                              const isDynamicBlock = _asana.every(
                                ({isAsanaInDynamicBlock}) =>
                                  isAsanaInDynamicBlock
                              )

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
                                    {_asana.map(renderSvg)}
                                  </View>
                                  <Text style={{fontSize: 10}}>
                                    {isDynamicBlock
                                      ? 'в динамике'
                                      : 'смена сторон'}
                                  </Text>
                                </View>
                              )
                            }

                            return renderSvg(_asana, index)
                          })}
                        </View>
                        <Text style={{fontSize: 10}}>
                          {isDynamicBlock ? 'в динамике' : 'смена сторон'}
                        </Text>
                      </View>
                    )
                  } else {
                    return renderSvg(asana, index)
                  }
                })}
              </View>
            )
          })}
        </View>
      </Page>
    </Document>
  )
}
