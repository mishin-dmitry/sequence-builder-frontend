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
    return <Svg width={70} height={70} key={index} />
  } else if (alias === 'separator') {
    return <Svg width={10} height={70} key={index} />
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
                          isNextElementBlock && _index === self.length - 1

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
                          isNextElementBlock && _index === self.length - 1

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
                  //   if (Array.isArray(asana)) {
                  //     const isDynamicBlock = asana.every(
                  //       ({isAsanaInDynamicBlock}) => isAsanaInDynamicBlock
                  //     )
                  //     const middleAsana = Math.floor(
                  //       calculateAsanasLength(asana) / 2
                  //     )
                  //     return asana.map((_asana, index, asanaSelf) => {
                  //       // Если попали сюда, значит асана находится и в динамике, и в блоке на обратную сторону
                  //       if (Array.isArray(_asana)) {
                  //         const middleAsanaIndex = Math.floor(_asana.length / 2)
                  //         const nextBlockOfAsanas =
                  //           index + 1 <= asanaSelf.length
                  //             ? asanaSelf[index + 1]
                  //             : null
                  //         let isNextBlockOfDynamicAsanas = false
                  //         let isNextBlockOfRepeatingAsanas = false
                  //         let shouldShowDynamicText = true
                  //         let shouldShowRepeatingText = true
                  //         if (Array.isArray(nextBlockOfAsanas)) {
                  // isNextBlockOfDynamicAsanas = nextBlockOfAsanas.every(
                  //   ({isAsanaInDynamicBlock}) => isAsanaInDynamicBlock
                  // )
                  // isNextBlockOfRepeatingAsanas =
                  //   nextBlockOfAsanas.every(
                  //     ({isAsanaInRepeatingBlock}) =>
                  //       isAsanaInRepeatingBlock
                  //   )
                  // const currentAndNextArraysLength =
                  //   nextBlockOfAsanas.length + _asana.length
                  // const _middleAsanaIndex = Math.floor(
                  //   currentAndNextArraysLength / 2
                  // )
                  // shouldShowDynamicText =
                  //   !isNextBlockOfDynamicAsanas ||
                  //   _middleAsanaIndex <= middleAsanaIndex
                  // shouldShowRepeatingText =
                  //   !isNextBlockOfRepeatingAsanas ||
                  //   _middleAsanaIndex <= middleAsanaIndex
                  //         }
                  // return _asana.map((_curAsana, _index) => (
                  //   <React.Fragment key={index}>
                  //     <View>
                  //       <View
                  //         style={{
                  //           borderBottom: '1px solid black',
                  //           paddingBottom: 5
                  //         }}>
                  //         {renderSvg(_curAsana, _index)}
                  //       </View>
                  //       {middleAsanaIndex !== _index && (
                  //         <View
                  //           style={{
                  //             height: 17.6,
                  //             borderBottom: '1px solid black'
                  //           }}
                  //         />
                  //       )}
                  //       {middleAsanaIndex === _index && (
                  //         <View>
                  //           <Text style={styles.text}>
                  //             {shouldShowDynamicText ? 'в динамике' : ''}
                  //           </Text>
                  //           <Text
                  //             style={{
                  //               ...styles.text,
                  //               borderTop: '1px solid black',
                  //               marginTop: 5
                  //             }}>
                  //             {shouldShowRepeatingText
                  //               ? 'смена сторон'
                  //               : ''}
                  //           </Text>
                  //         </View>
                  //       )}
                  //     </View>
                  //   </React.Fragment>
                  // ))
                  //       }
                  //       const previousElement = index
                  //         ? asanaSelf[index - 1]
                  //         : null
                  //       // const previousElement = preparedAsanaIndex
                  //       //   ? preparedAsanasSelf[preparedAsanaIndex - 1]
                  //       //   : null
                  //       const isLastPreviousElementHasBothBlocks =
                  //         Array.isArray(previousElement)
                  //       // const isLastPreviousElementHasBothBlocks =
                  //       //   Array.isArray(previousElement) &&
                  //       //   Array.isArray(previousElement[0])
                  //       let shouldRenderText = middleAsana === index
                  //       // Если предыдущий элемент имеет и динамику и смену сторон, мы должны пересчитать средний индекс
                  //       if (isLastPreviousElementHasBothBlocks) {
                  //         const prevElementLength =
                  //           previousElement.flat(Infinity).length
                  //         const currentAndPreviousArraysLength =
                  //           prevElementLength + asanaSelf.length
                  //         const _middleAsanaIndex = Math.floor(
                  //           currentAndPreviousArraysLength / 2
                  //         )
                  // shouldRenderText =
                  //   index + prevElementLength === _middleAsanaIndex
                  //       }
                  // // Если попали сюда, значит мы находимся в блоке асан с динамикой или на другую сторону
                  // return (
                  //   <React.Fragment key={index}>
                  //     <View>
                  //       <View
                  //         style={{
                  //           borderBottom: '1px solid black',
                  //           paddingBottom:
                  //             isLastPreviousElementHasBothBlocks &&
                  //             !isDynamicBlock
                  //               ? 22.6
                  //               : 5
                  //         }}>
                  //         {renderSvg(_asana, index)}
                  //       </View>
                  //       {shouldRenderText && (
                  //         <Text style={styles.text}>
                  //           {isDynamicBlock ? 'в динамике' : 'смена сторон'}
                  //         </Text>
                  //       )}
                  //     </View>
                  //   </React.Fragment>
                  // )
                  //     })
                  //   } else {
                  //     return renderSvg(asana, preparedAsanaIndex)
                  //   }
                })}
              </View>
            )
          })}
        </View>
      </Page>
    </Document>
  )
}
