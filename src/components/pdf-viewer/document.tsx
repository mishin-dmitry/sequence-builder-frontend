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

import {
  type AsanaBlock,
  prepareAsanasBlock,
  BlockType,
  isDynamicOrRepeating
} from './utils'

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
        style={{marginTop: 3}}
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

interface RenderDynamicOrRepeatingBlockArgs {
  type: BlockType.DYNAMIC | BlockType.REPEATING
  asanasBlock: AsanaBlock
  nextElement: Asana | AsanaBlock | null
  isNextElementHasBothBlocks: boolean
  isPreviousElementHasBothBlocks: boolean
  index: number
}

interface GetPaddingBottomArgs
  extends Pick<
    RenderDynamicOrRepeatingBlockArgs,
    'isNextElementHasBothBlocks' | 'isPreviousElementHasBothBlocks' | 'type'
  > {
  isFirstElement: boolean
  isLastElement: boolean
}

const getPaddingBottom = ({
  isFirstElement,
  isLastElement,
  isNextElementHasBothBlocks,
  isPreviousElementHasBothBlocks,
  type
}: GetPaddingBottomArgs): number => {
  if (type === BlockType.DYNAMIC) {
    if (
      isNextElementHasBothBlocks &&
      isFirstElement &&
      !isPreviousElementHasBothBlocks
    )
      return 0

    if (
      isLastElement &&
      isPreviousElementHasBothBlocks &&
      !isNextElementHasBothBlocks
    )
      return 0

    if (isNextElementHasBothBlocks || isPreviousElementHasBothBlocks) {
      return 29.6
    }
  }

  if (
    (isFirstElement && !isPreviousElementHasBothBlocks) ||
    (isLastElement && !isNextElementHasBothBlocks)
  ) {
    return 0
  }

  return 5
}

const renderDynamicOrRepeatingBlock = ({
  type,
  asanasBlock,
  isPreviousElementHasBothBlocks,
  isNextElementHasBothBlocks,
  nextElement,
  index
}: RenderDynamicOrRepeatingBlockArgs): any => {
  return asanasBlock.asanas.map((asana, _index, self) => {
    const isLastElement = _index === self.length - 1
    const isFirstElement = !_index

    let shouldRenderText

    if (type === 'repeating') {
      shouldRenderText = isLastElement && !isNextElementHasBothBlocks
    } else {
      shouldRenderText = isFirstElement && !isPreviousElementHasBothBlocks
    }

    const shouldInsertSeparator =
      isDynamicOrRepeating(nextElement) &&
      nextElement.type !== BlockType.BOTH &&
      isLastElement

    return (
      <React.Fragment key={index}>
        <View>
          <View
            style={{
              borderBottom: '1px solid black',
              paddingBottom: getPaddingBottom({
                type,
                isFirstElement,
                isLastElement,
                isNextElementHasBothBlocks,
                isPreviousElementHasBothBlocks
              })
            }}>
            {(isFirstElement && !isPreviousElementHasBothBlocks) ||
            (isLastElement && !isNextElementHasBothBlocks) ? (
              <View>
                <>
                  {renderSvg(asana, _index)}
                  <View
                    style={{
                      height: 5,
                      ...(isFirstElement && !isPreviousElementHasBothBlocks
                        ? {borderLeft: '1px solid black'}
                        : {}),
                      ...(isLastElement && !isNextElementHasBothBlocks
                        ? {borderRight: '1px solid black'}
                        : {}),
                      ...(type === BlockType.DYNAMIC &&
                      isFirstElement &&
                      isNextElementHasBothBlocks
                        ? {marginTop: 24.6}
                        : {}),
                      ...(type === BlockType.DYNAMIC &&
                      isLastElement &&
                      isPreviousElementHasBothBlocks
                        ? {marginTop: 24.6}
                        : {})
                    }}
                  />
                </>
              </View>
            ) : (
              renderSvg(asana, _index)
            )}
          </View>
          {shouldRenderText && (
            <Text style={styles.text}>
              {type === BlockType.REPEATING ? 'смена сторон' : 'в динамике'}
            </Text>
          )}
        </View>
        {shouldInsertSeparator && <Svg width={5} height={70} />}
      </React.Fragment>
    )
  })
}

interface RenderBothBlocksArgs
  extends Pick<
    RenderDynamicOrRepeatingBlockArgs,
    'index' | 'asanasBlock' | 'nextElement'
  > {
  prevElement: Asana | AsanaBlock | null
}

const renderBothBlocks = ({
  index,
  nextElement,
  prevElement,
  asanasBlock
}: RenderBothBlocksArgs): any => {
  const isNextElementDynamicOrRepeating =
    isDynamicOrRepeating(nextElement) && nextElement.type !== BlockType.BOTH

  const isPrevElementDynamicOrRepeating =
    isDynamicOrRepeating(prevElement) && prevElement.type !== BlockType.BOTH

  const isPrevElementRepeating =
    isDynamicOrRepeating(prevElement) &&
    prevElement.type === BlockType.REPEATING

  const isNextElementRepeating =
    isDynamicOrRepeating(nextElement) &&
    nextElement.type === BlockType.REPEATING

  const isPrevElementDynamic =
    isDynamicOrRepeating(prevElement) && prevElement.type === BlockType.DYNAMIC

  const isNextElementDynamic =
    isDynamicOrRepeating(nextElement) && nextElement.type === BlockType.DYNAMIC

  const shouldRenderText =
    !isNextElementDynamicOrRepeating && !isPrevElementDynamicOrRepeating

  let shouldShowDynamicText = shouldRenderText
  let shouldShowRepeatingText = shouldRenderText

  if (isNextElementDynamicOrRepeating) {
    const isNextBlockOfRepeatingAsanas = nextElement.asanas.every(
      ({inRepeatingBlock}) => inRepeatingBlock
    )

    if (!isNextBlockOfRepeatingAsanas) {
      shouldShowRepeatingText = true
    }
  }

  if (isPrevElementDynamicOrRepeating) {
    const isPrevBlockOfDynamicAsanas = prevElement.asanas.every(
      ({inDynamicBlock}) => inDynamicBlock
    )

    if (!isPrevBlockOfDynamicAsanas) {
      shouldShowDynamicText = true
    }
  }

  if (!prevElement) {
    shouldShowDynamicText = true
  }

  if (!nextElement) {
    shouldShowRepeatingText = true
  }

  return asanasBlock.asanas.map((asana, _index, self) => {
    const isLastElement = _index === self.length - 1
    const isFirstElement = !_index

    const shouldShowRepeatingTextForItem =
      shouldShowRepeatingText && isLastElement

    const shouldShowDynamicTextForItem = shouldShowDynamicText && isFirstElement

    const shouldAddLeftBorderToRepeatingText =
      isFirstElement && !isPrevElementRepeating

    const shouldAddRightBorderToRepeatingText =
      isLastElement && !isNextElementRepeating

    const shouldAddLeftOrRightBorderToRepeatingText =
      shouldAddLeftBorderToRepeatingText || shouldAddRightBorderToRepeatingText

    const shouldAddLeftBorderToDynamicText =
      isFirstElement && !isPrevElementDynamic

    const shouldAddRightBorderToDynamicText =
      isLastElement && !isNextElementDynamic

    const shouldAddLeftOrRightBorderToDynamicText =
      shouldAddLeftBorderToDynamicText

    return (
      <React.Fragment key={index}>
        <View>
          <View
            style={{
              borderBottom: '1px solid black',
              display: 'flex',
              alignItems: 'center',
              paddingBottom: shouldAddLeftOrRightBorderToRepeatingText ? 0 : 5
            }}>
            {shouldAddLeftOrRightBorderToRepeatingText ? (
              <View>
                <>
                  {renderSvg(asana, _index)}
                  <View
                    style={{
                      height: 5,
                      ...(shouldAddLeftBorderToRepeatingText
                        ? {borderLeft: '1px solid black'}
                        : {}),
                      ...(shouldAddRightBorderToRepeatingText
                        ? {borderRight: '1px solid black'}
                        : {})
                    }}
                  />
                </>
              </View>
            ) : (
              renderSvg(asana, _index)
            )}
          </View>
          <View>
            <Text style={styles.text}>
              {shouldShowRepeatingTextForItem ? 'смена сторон' : ''}
            </Text>
            {shouldAddLeftOrRightBorderToDynamicText ? (
              <View
                style={{marginTop: shouldShowRepeatingTextForItem ? 7 : 18.7}}>
                <>
                  <View
                    style={{
                      height: 5,
                      ...(shouldAddLeftBorderToDynamicText
                        ? {borderLeft: '1px solid black'}
                        : {}),
                      ...(shouldAddRightBorderToDynamicText
                        ? {borderRight: '1px solid black'}
                        : {})
                    }}
                  />

                  <Text
                    style={{
                      ...styles.text,
                      borderTop: '1px solid black'
                    }}>
                    {shouldShowDynamicTextForItem ? 'в динамике' : ''}
                  </Text>
                </>
              </View>
            ) : shouldAddRightBorderToDynamicText ? (
              <View
                style={{marginTop: shouldShowRepeatingTextForItem ? 7 : 18.7}}>
                <>
                  <View
                    style={{
                      height: 5,
                      ...(shouldAddLeftBorderToDynamicText
                        ? {borderLeft: '1px solid black'}
                        : {}),
                      ...(shouldAddRightBorderToDynamicText
                        ? {borderRight: '1px solid black'}
                        : {})
                    }}
                  />

                  <Text
                    style={{
                      ...styles.text,
                      borderTop: '1px solid black'
                    }}>
                    {shouldShowDynamicTextForItem ? 'в динамике' : ''}
                  </Text>
                </>
              </View>
            ) : (
              <Text
                style={{
                  ...styles.text,
                  borderTop: '1px solid black',
                  marginTop: shouldShowRepeatingTextForItem ? 12 : 23.7
                }}>
                {shouldShowDynamicTextForItem ? 'в динамике' : ''}
              </Text>
            )}
          </View>
        </View>
      </React.Fragment>
    )
  })
}

export const PDFDocument = ({asanas: asanasProp}: Sequence): any => {
  return (
    <Document>
      <Page orientation="landscape" style={styles.page}>
        <View style={styles.columnView}>
          {Object.values(asanasProp).map((asanasBlock, blockIndex) => {
            // Асаны в конкретном блоке. Либо просто асана,
            // либо последовательность с динамикой или сменой сторон
            const blockAsanas = prepareAsanasBlock(asanasBlock)

            return (
              <View style={styles.rowView} key={blockIndex}>
                {blockAsanas.map((asana: Asana | AsanaBlock, index, self) => {
                  // Если перед нами блок с динамикой или сменой сторон
                  if (isDynamicOrRepeating(asana)) {
                    const {type} = asana

                    const prevElement = index ? self[index - 1] : null

                    const nextElement =
                      index < self.length - 1 ? self[index + 1] : null

                    const isPreviousElementHasBothBlocks =
                      isDynamicOrRepeating(prevElement) &&
                      prevElement.type === BlockType.BOTH

                    const isNextElementHasBothBlocks =
                      isDynamicOrRepeating(nextElement) &&
                      nextElement.type === BlockType.BOTH

                    if (type === BlockType.REPEATING) {
                      return renderDynamicOrRepeatingBlock({
                        type: BlockType.REPEATING,
                        asanasBlock: asana,
                        isNextElementHasBothBlocks,
                        isPreviousElementHasBothBlocks,
                        index,
                        nextElement
                      })
                    }

                    if (type === BlockType.DYNAMIC) {
                      return renderDynamicOrRepeatingBlock({
                        type: BlockType.DYNAMIC,
                        asanasBlock: asana,
                        isNextElementHasBothBlocks,
                        isPreviousElementHasBothBlocks,
                        index,
                        nextElement
                      })
                    }

                    if (type === BlockType.BOTH) {
                      return renderBothBlocks({
                        index,
                        nextElement,
                        prevElement,
                        asanasBlock: asana
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
