import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {useSortable} from '@dnd-kit/sortable'
import {Button, Tooltip} from 'antd'
import {ColumnWidthOutlined, DeleteOutlined} from '@ant-design/icons'

import styles from './styles.module.css'
import clsx from 'clsx'

interface SortableItemProps {
  children: React.ReactNode
  id: string
  index: number
  className?: string
  isMobile?: boolean
  isAsanaInRepeatingBlock?: boolean
  onDelete: (id: number) => void
  addAsanaToRepeatingBlock: (id: number, action: 'add' | 'delete') => void
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  className,
  index,
  isMobile,
  onDelete,
  isAsanaInRepeatingBlock,
  addAsanaToRepeatingBlock
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
          styles.rowButton,
          !isButtonsVisible && isAsanaInRepeatingBlock && styles.singleButton
        )}
        icon={<ColumnWidthOutlined />}
        onClick={() =>
          addAsanaToRepeatingBlock(
            index,
            isAsanaInRepeatingBlock ? 'delete' : 'add'
          )
        }
      />
    ),
    [addAsanaToRepeatingBlock, index, isAsanaInRepeatingBlock, isButtonsVisible]
  )

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        styles.wrapper,
        isSorting && styles.sorting,
        isDragging && styles.dragOverlay,
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
          isAsanaInRepeatingBlock && styles.blue
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
        {isButtonsVisible && (
          <Button
            danger
            shape="circle"
            type="primary"
            data-no-dnd="true"
            className={styles.deleteButton}
            icon={<DeleteOutlined />}
            onClick={() => onDelete(index)}
          />
        )}
        <span className={styles.index}>{index + 1}</span>
      </div>
    </div>
  )
}
