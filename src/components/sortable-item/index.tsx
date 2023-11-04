import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {useSortable} from '@dnd-kit/sortable'
import {Button, Tooltip} from 'antd'
import {
  ArrowLeftOutlined,
  CopyOutlined,
  DeleteOutlined,
  RetweetOutlined
} from '@ant-design/icons'

import styles from './styles.module.css'
import clsx from 'clsx'

interface SortableItemProps {
  children: React.ReactNode
  id: string
  index: number
  count?: number
  className?: string
  isMobile?: boolean
  isAsanaInRepeatingBlock?: boolean
  isAsanaInDynamicBlock?: boolean
  onDelete: (id: number) => void
  addAsanasToBlock: (
    id: number,
    block: 'repeating' | 'dynamic',
    action: 'add' | 'delete'
  ) => void
  copyAsana: () => void
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  className,
  index,
  count,
  isMobile,
  onDelete,
  isAsanaInRepeatingBlock,
  isAsanaInDynamicBlock,
  addAsanasToBlock,
  copyAsana
}) => {
  const [isButtonsVisible, setIsButtonsVisible] = useState(false)

  const toggleButtonVisible = useCallback(
    () => setIsButtonsVisible((prevState) => !prevState),
    []
  )

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting
  } = useSortable({
    id,
    animateLayoutChanges: () => false
  })

  useEffect(() => {
    if (isDragging && isButtonsVisible) {
      setIsButtonsVisible(false)
    }
  }, [isButtonsVisible, isDragging])

  const style = {
    transition,
    transform: `translate3d(${Math.round(transform?.x || 0)}px, ${Math.round(
      transform?.y || 0
    )}px, 0) scaleX(${transform?.scaleX || 1}) scaleY(${
      transform?.scaleY || 1
    })`
  }

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
          !isButtonsVisible && isAsanaInRepeatingBlock && styles.singleButton
        )}
        icon={<ArrowLeftOutlined />}
        onClick={() =>
          addAsanasToBlock(
            index,
            'repeating',
            isAsanaInRepeatingBlock ? 'delete' : 'add'
          )
        }
      />
    ),
    [addAsanasToBlock, index, isAsanaInRepeatingBlock, isButtonsVisible]
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
            isAsanaInDynamicBlock &&
            !isAsanaInRepeatingBlock &&
            styles.singleButton,
          !isButtonsVisible &&
            isAsanaInDynamicBlock &&
            isAsanaInRepeatingBlock &&
            styles.multipleButton
        )}
        icon={<RetweetOutlined />}
        onClick={() =>
          addAsanasToBlock(
            index,
            'dynamic',
            isAsanaInDynamicBlock ? 'delete' : 'add'
          )
        }
      />
    ),
    [
      addAsanasToBlock,
      index,
      isAsanaInDynamicBlock,
      isAsanaInRepeatingBlock,
      isButtonsVisible
    ]
  )

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        styles.wrapper,
        isSorting && styles.sorting,
        isDragging && styles.dragOverlay,
        isMobile && styles.mobile,
        className
      )}
      style={style}
      {...props}
      {...attributes}
      {...listeners}>
      <div
        className={clsx(
          styles.item,
          isDragging && styles.dragging,
          isAsanaInRepeatingBlock && !isAsanaInDynamicBlock && styles.repeating,
          isAsanaInDynamicBlock && !isAsanaInRepeatingBlock && styles.dynamic,
          isAsanaInRepeatingBlock && isAsanaInDynamicBlock && styles.bothBlocks
        )}>
        {children}
        {(isButtonsVisible || isAsanaInRepeatingBlock) &&
          (isMobile ? (
            repeatingBlockButton
          ) : (
            <Tooltip
              title={`${
                isAsanaInRepeatingBlock ? 'Убрать из блока' : 'Добавить в блок'
              } с повтором на другую сторону`}
              style={{width: 100}}>
              {repeatingBlockButton}
            </Tooltip>
          ))}
        {(isButtonsVisible || isAsanaInDynamicBlock) &&
          (isMobile ? (
            dynamicBlockButton
          ) : (
            <Tooltip
              title={`${
                isAsanaInDynamicBlock ? 'Убрать из блока' : 'Добавить в блок'
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
          </>
        )}
        {count && <span className={styles.index}>{count}</span>}
      </div>
    </div>
  )
}
