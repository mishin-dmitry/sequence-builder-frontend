'use client'
import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {useSortable} from '@dnd-kit/sortable'
import {Button} from 'antd'
import {DeleteOutlined} from '@ant-design/icons'

import styles from './styles.module.css'
import clsx from 'clsx'

interface SortableItemProps {
  children: React.ReactNode
  id: string
  index: number
  className?: string
  isMobile?: boolean
  onDelete: (id: number) => void
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  className,
  index,
  isMobile,
  onDelete
}) => {
  const [isButtonVisible, setIsButtonVisible] = useState(false)

  const toggleButtonVisible = useCallback(
    () => setIsButtonVisible((prevState) => !prevState),
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
    if (isDragging && isButtonVisible) {
      setIsButtonVisible(false)
    }
  }, [isButtonVisible, isDragging])

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
            onMouseEnter: () => setIsButtonVisible(true),
            onMouseLeave: () => setIsButtonVisible(false)
          },
    [isMobile, toggleButtonVisible]
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
      <div className={clsx(styles.item, isDragging && styles.dragging)}>
        {children}
        {isButtonVisible && (
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
