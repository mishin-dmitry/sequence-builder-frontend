import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {useSortable} from '@dnd-kit/sortable'
import {Button, Tooltip} from 'antd'

import {
  ArrowLeftOutlined,
  CopyOutlined,
  DeleteOutlined,
  RetweetOutlined,
  ToTopOutlined
} from '@ant-design/icons'

import {CSS} from '@dnd-kit/utilities'

import {useSettings} from 'context/settings'

import type {Asana} from 'types'

import styles from './styles.module.css'
import clsx from 'clsx'

interface SortableItemProps {
  children: React.ReactNode
  id: string
  asana: Asana & {count?: number}
  index: number
  className?: string
  blockId: string
  onDelete: (id: number) => void
  addAsanasToBlock: (
    id: number,
    block: 'repeating' | 'dynamic',
    action: 'add' | 'delete'
  ) => void
  copyAsana: () => void
  scrollToAsana: (id: number) => void
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  className,
  index,
  blockId,
  onDelete,
  addAsanasToBlock,
  copyAsana,
  scrollToAsana: scrollToAsanaProp,
  asana
}) => {
  const [isButtonsVisible, setIsButtonsVisible] = useState(false)

  const {isMobile} = useSettings()
  const {inRepeatingBlock, inDynamicBlock, count, name, id: asanaId} = asana

  const toggleButtonVisible = useCallback(
    () => setIsButtonsVisible((prevState) => !prevState),
    []
  )

  const {attributes, listeners, setNodeRef, isDragging, transform, transition} =
    useSortable({
      id,
      data: {
        data: asana,
        blockId
      }
    })

  useEffect(() => {
    if (isDragging && isButtonsVisible) {
      setIsButtonsVisible(false)
    }
  }, [isButtonsVisible, isDragging])

  const props = useMemo(
    () =>
      isMobile
        ? {onClick: toggleButtonVisible}
        : {
            onMouseEnter: () => setIsButtonsVisible(true),
            onMouseLeave: () => setIsButtonsVisible(false)
          },
    [isMobile, toggleButtonVisible]
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
          addAsanasToBlock(
            index,
            'repeating',
            inRepeatingBlock ? 'delete' : 'add'
          )
        }
      />
    ),
    [addAsanasToBlock, index, inRepeatingBlock, isButtonsVisible]
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
          addAsanasToBlock(index, 'dynamic', inDynamicBlock ? 'delete' : 'add')
        }
      />
    ),
    [
      addAsanasToBlock,
      index,
      inDynamicBlock,
      inRepeatingBlock,
      isButtonsVisible
    ]
  )

  const scrollToAsana = useCallback(
    () => scrollToAsanaProp(asanaId),
    [asanaId, scrollToAsanaProp]
  )

  return (
    <Tooltip title={name}>
      <div
        ref={setNodeRef}
        className={clsx(styles.wrapper, className)}
        style={{
          transition,
          transform: CSS.Transform.toString(transform),
          opacity: isDragging ? 0.5 : 1
        }}
        {...props}
        {...attributes}
        {...listeners}>
        <div
          className={clsx(
            styles.item,
            inRepeatingBlock && !inDynamicBlock && styles.repeating,
            inDynamicBlock && !inRepeatingBlock && styles.dynamic,
            inRepeatingBlock && inDynamicBlock && styles.bothBlocks
          )}>
          {children}
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
          {isButtonsVisible && (
            <>
              <Button
                danger
                shape="circle"
                type="primary"
                data-no-dnd="true"
                className={styles.deleteButton}
                icon={<DeleteOutlined />}
                onClick={() => onDelete(index)}
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
  )
}
