import React, {useCallback, useMemo, useState} from 'react'

import {SortableItem} from 'components/sortable-item'
import {AsanaImage} from 'components/asana-image'
import {useSettings} from 'context/settings'
import {Button, Tooltip} from 'antd'

import {
  ArrowLeftOutlined,
  CopyOutlined,
  DeleteOutlined,
  RetweetOutlined,
  ToTopOutlined
} from '@ant-design/icons'

import type {Asana as TAsana} from 'types'

import styles from './styles.module.css'
import clsx from 'clsx'

interface AsanaProps {
  id: string
  index: number
  asana: TAsana & {count?: number}
  className?: string
  blockId: string
  // Скрыты кнопки добавить в блок с динамикой/повтором
  isBlockButtonsHidden?: boolean
  copyAsana: (asana: TAsana, index: number, blockId: string) => void
  onDeleteAsana: (id: number) => void
  addAsanaToBlock: (
    id: number,
    block: 'repeating' | 'dynamic',
    action: 'add' | 'delete'
  ) => void
  scrollToAsana: (id: number) => void
}

export const Asana: React.FC<AsanaProps> = ({
  id,
  index,
  asana,
  className,
  blockId,
  copyAsana: copyAsanaProp,
  onDeleteAsana,
  scrollToAsana: scrollToAsanaProp,
  addAsanaToBlock,
  isBlockButtonsHidden
}) => {
  const [isButtonsVisible, setIsButtonsVisible] = useState(false)

  const {
    alias,
    name,
    inRepeatingBlock,
    inDynamicBlock,
    count,
    id: asanaId
  } = asana

  const {isDarkTheme, isMobile} = useSettings()

  const toggleButtonVisible = useCallback(
    () => setIsButtonsVisible((prevState) => !prevState),
    []
  )

  const copyAsana = useCallback(
    () => copyAsanaProp(asana, index, blockId),
    [asana, blockId, copyAsanaProp, index]
  )

  const onMouseEnter = useCallback(() => setIsButtonsVisible(true), [])

  const onMouseLeave = useCallback(() => setIsButtonsVisible(false), [])

  const scrollToAsana = useCallback(
    () => scrollToAsanaProp(asanaId),
    [asanaId, scrollToAsanaProp]
  )

  const onDelete = useCallback(
    () => onDeleteAsana(index),
    [index, onDeleteAsana]
  )

  const repeatingBlockButton = useMemo(
    () => (
      <Button
        shape="circle"
        type="primary"
        data-no-dnd="true"
        className={clsx(
          styles.repeatButton,
          !isButtonsVisible && inRepeatingBlock && styles.singleButton
        )}
        icon={<ArrowLeftOutlined />}
        onClick={() =>
          addAsanaToBlock(
            index,
            'repeating',
            inRepeatingBlock ? 'delete' : 'add'
          )
        }
      />
    ),
    [addAsanaToBlock, index, inRepeatingBlock, isButtonsVisible]
  )

  const dynamicBlockButton = useMemo(
    () => (
      <Button
        shape="circle"
        type="primary"
        data-no-dnd="true"
        className={clsx(
          styles.dynamicButton,
          !isButtonsVisible &&
            inDynamicBlock &&
            !inRepeatingBlock &&
            styles.singleButton,
          !isButtonsVisible &&
            inDynamicBlock &&
            inRepeatingBlock &&
            styles.multipleButton
        )}
        icon={<RetweetOutlined />}
        onClick={() =>
          addAsanaToBlock(index, 'dynamic', inDynamicBlock ? 'delete' : 'add')
        }
      />
    ),
    [addAsanaToBlock, index, inDynamicBlock, inRepeatingBlock, isButtonsVisible]
  )

  const sortableData = useMemo(
    () => ({blockId, data: asana, index}),
    [asana, blockId, index]
  )

  return (
    <SortableItem
      id={id}
      sortableData={sortableData}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={toggleButtonVisible}
      className={clsx(styles.sortableWrapper, className)}>
      <Tooltip title={name}>
        <div
          className={clsx(
            styles.item,
            inRepeatingBlock && !inDynamicBlock && styles.repeating,
            inDynamicBlock && !inRepeatingBlock && styles.dynamic,
            inRepeatingBlock && inDynamicBlock && styles.bothBlocks,
            isBlockButtonsHidden && styles.hiddenBlockButtons
          )}>
          <div
            className={clsx(
              styles.imageWrapper,
              (alias === 'empty' || alias === 'separator') && styles.empty
            )}>
            <AsanaImage
              alias={alias}
              isDarkTheme={isDarkTheme}
              width={70}
              height={70}
            />

            {alias === 'empty' && <span>Пустое место</span>}
            {alias === 'separator' && <span>Разделитель</span>}

            {!isBlockButtonsHidden && (
              <>
                {(isButtonsVisible || inRepeatingBlock) &&
                  (isMobile ? (
                    repeatingBlockButton
                  ) : (
                    <Tooltip
                      title={`${
                        inRepeatingBlock ? 'Убрать из блока' : 'Добавить в блок'
                      } с повтором на другую сторону`}
                      style={{width: 100}}>
                      {repeatingBlockButton}
                    </Tooltip>
                  ))}
                {(isButtonsVisible || inDynamicBlock) &&
                  (isMobile ? (
                    dynamicBlockButton
                  ) : (
                    <Tooltip
                      title={`${
                        inDynamicBlock ? 'Убрать из блока' : 'Добавить в блок'
                      } с динамикой`}
                      style={{width: 100}}>
                      {dynamicBlockButton}
                    </Tooltip>
                  ))}
              </>
            )}
            {isButtonsVisible && (
              <>
                <Button
                  danger
                  shape="circle"
                  type="primary"
                  data-no-dnd="true"
                  className={styles.deleteButton}
                  icon={<DeleteOutlined />}
                  onClick={onDelete}
                />
                <Tooltip
                  {...(isMobile && {open: false})}
                  style={{width: 100}}
                  title="Скопировать асану">
                  <Button
                    shape="circle"
                    data-no-dnd="true"
                    className={styles.copyButton}
                    icon={<CopyOutlined />}
                    onClick={copyAsana}
                  />
                </Tooltip>
                {!isMobile && (
                  <Tooltip style={{width: 100}} title="Перейти к асане">
                    <Button
                      shape="circle"
                      data-no-dnd="true"
                      className={styles.scrollButton}
                      icon={<ToTopOutlined />}
                      onClick={scrollToAsana}
                    />
                  </Tooltip>
                )}
              </>
            )}
            {!!count && <span className={styles.index}>{count}</span>}
          </div>
        </div>
      </Tooltip>
    </SortableItem>
  )
}
