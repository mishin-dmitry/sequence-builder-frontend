import React from 'react'

import {useSortable} from '@dnd-kit/sortable'

import styles from './styles.module.css'
import clsx from 'clsx'

interface SortableItemProps {
  children: React.ReactNode
  id: string
}

export const SortableItem: React.FC<SortableItemProps> = ({id, children}) => {
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

  const style = {
    transition,
    transform: `translate3d(${Math.round(transform?.x || 0)}px, ${Math.round(
      transform?.y || 0
    )}px, 0) scaleX(${transform?.scaleX || 1}) scaleY(${
      transform?.scaleY || 1
    })`
  }

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        styles.Wrapper,
        isSorting && styles.sorting,
        isDragging && styles.dragOverlay
      )}
      style={style}
      {...attributes}
      {...listeners}>
      <div className={clsx(styles.Item, isDragging && styles.dragging)}>
        {children}
      </div>
    </div>
  )
}
