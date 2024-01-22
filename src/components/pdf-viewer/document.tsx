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

import {type Asana} from 'types'

import {
  DEFAULT_ICON_HEIGHT,
  createSVGPdfRendererComponent,
  DEFAULT_ICON_WIDTH
} from 'lib/svg-to-components'

import {iconsMap} from 'icons'

import {type AsanaBlock, prepareAsanasBlock, isBlock, BlockType} from './utils'

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
  },
  text: {
    fontSize: 10,
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

const renderSvg = ({alias}: Asana, index: number): any => {
  if (alias === 'empty') {
    return (
      <Svg
        width={DEFAULT_ICON_WIDTH}
        height={DEFAULT_ICON_HEIGHT}
        key={index}
      />
    )
  } else if (alias === 'separator') {
    return <Svg width={10} height={DEFAULT_ICON_HEIGHT} key={index} />
  } else {
    return iconsMap[alias]
      ? createSVGPdfRendererComponent(iconsMap[alias])
      : undefined
  }
}

export const PDFDocument = ({asanas: asanasProp}: Sequence): any => {
  return (
    <Document>
      <Page orientation="landscape" style={styles.page}>
        <View style={styles.columnView}>
          {Object.values(asanasProp).map((asanasBlock, blockIndex) => {
            const asanas = prepareAsanasBlock(asanasBlock)

            return (
              <View style={styles.rowView} key={blockIndex}>
                {asanas.map((asana: Asana | AsanaBlock, index, self) => {
                  if (isBlock(asana)) {
                    const {asanas, type} = asana

                    const prevElement = index ? self[index - 1] : null

                    const nextElement =
                      index < self.length - 1 ? self[index + 1] : null

                    const isNextElementBlock =
                      isBlock(nextElement) && isBlock(asana)

                    const isPreviousElementHasBothBlocks =
                      isBlock(prevElement) &&
                      prevElement.type === BlockType.BOTH

                    const blockMiddleAsanaIndex = Math.floor(asanas.length / 2)

                    const separator = <Svg width={5} height={70} key={index} />

                    if (type === BlockType.REPEATING) {
                      return asanas.map((asana, _index, self) => {
                        let shouldRenderText = _index === blockMiddleAsanaIndex

                        const shouldInsertSeparator =
                          isNextElementBlock &&
                          nextElement.type !== BlockType.BOTH &&
                          _index === self.length - 1

                        if (isPreviousElementHasBothBlocks) {
                          const prevElementLength = prevElement.asanas.length

                          const currentAndPreviousArraysLength =
                            prevElementLength + self.length

                          const _middleAsanaIndex = Math.floor(
                            currentAndPreviousArraysLength / 2
                          )

                          shouldRenderText =
                            _index + prevElementLength === _middleAsanaIndex
                        }

                        return (
                          <React.Fragment key={index}>
                            <View>
                              <View
                                style={{
                                  borderBottom: '1px solid black',
                                  paddingBottom: 5
                                }}>
                                {renderSvg(asana, _index)}
                              </View>
                              {shouldRenderText && (
                                <Text style={styles.text}>смена сторон</Text>
                              )}
                            </View>
                            {shouldInsertSeparator && separator}
                          </React.Fragment>
                        )
                      })
                    }

                    if (type === BlockType.DYNAMIC) {
                      return asanas.map((asana, _index, self) => {
                        let shouldRenderText = _index === blockMiddleAsanaIndex

                        const shouldInsertSeparator =
                          isNextElementBlock &&
                          nextElement.type !== BlockType.BOTH &&
                          _index === self.length - 1

                        if (isPreviousElementHasBothBlocks) {
                          const prevElementLength = prevElement.asanas.length

                          const currentAndPreviousArraysLength =
                            prevElementLength + self.length

                          const _middleAsanaIndex = Math.floor(
                            currentAndPreviousArraysLength / 2
                          )

                          shouldRenderText =
                            _index + prevElementLength === _middleAsanaIndex
                        }

                        return (
                          <React.Fragment key={index}>
                            <View>
                              <View
                                style={{
                                  borderBottom: '1px solid black',
                                  paddingBottom: isPreviousElementHasBothBlocks
                                    ? 22.6
                                    : 5
                                }}>
                                {renderSvg(asana, _index)}
                              </View>
                              {shouldRenderText && (
                                <Text style={styles.text}>в динамике</Text>
                              )}
                            </View>
                            {shouldInsertSeparator && separator}
                          </React.Fragment>
                        )
                      })
                    }

                    if (type === BlockType.BOTH) {
                      let shouldShowDynamicText = true
                      let shouldShowRepeatingText = true

                      if (isNextElementBlock) {
                        const isNextBlockOfDynamicAsanas =
                          nextElement.asanas.every(
                            ({isAsanaInDynamicBlock}) => isAsanaInDynamicBlock
                          )

                        const isNextBlockOfRepeatingAsanas =
                          nextElement.asanas.every(
                            ({isAsanaInRepeatingBlock}) =>
                              isAsanaInRepeatingBlock
                          )

                        const currentAndNextArraysLength =
                          nextElement.asanas.length + asanas.length

                        const _middleAsanaIndex = Math.floor(
                          currentAndNextArraysLength / 2
                        )

                        shouldShowDynamicText =
                          !isNextBlockOfDynamicAsanas ||
                          _middleAsanaIndex <= blockMiddleAsanaIndex

                        shouldShowRepeatingText =
                          !isNextBlockOfRepeatingAsanas ||
                          _middleAsanaIndex <= blockMiddleAsanaIndex
                      }

                      return asanas.map((asana, _index) => {
                        const shouldInsertSeparator =
                          isNextElementBlock && _index === self.length - 1

                        return (
                          <React.Fragment key={index}>
                            <View>
                              <View
                                style={{
                                  borderBottom: '1px solid black',
                                  display: 'flex',
                                  alignItems: 'center',
                                  paddingBottom: 5
                                }}>
                                {renderSvg(asana, _index)}
                              </View>
                              {blockMiddleAsanaIndex !== _index && (
                                <View
                                  style={{
                                    height: 17.6,
                                    borderBottom: '1px solid black'
                                  }}
                                />
                              )}
                              {blockMiddleAsanaIndex === _index && (
                                <View>
                                  <Text style={styles.text}>
                                    {shouldShowRepeatingText
                                      ? 'смена сторон'
                                      : ''}
                                  </Text>
                                  <Text
                                    style={{
                                      ...styles.text,
                                      borderTop: '1px solid black',
                                      marginTop: shouldShowRepeatingText
                                        ? 5
                                        : 16.7
                                    }}>
                                    {shouldShowDynamicText ? 'в динамике' : ''}
                                  </Text>
                                </View>
                              )}
                              {shouldInsertSeparator && separator}
                            </View>
                          </React.Fragment>
                        )
                      })
                    }
                  }

                  return renderSvg(asana as Asana, index)
                })}
              </View>
            )
          })}
        </View>
      </Page>
    </Document>
  )
}
