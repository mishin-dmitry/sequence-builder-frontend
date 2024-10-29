import React, {useEffect} from 'react'

import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {useSettings} from 'context/settings'

import type {Asana} from 'types'

import styles from './styles.module.css'
import clsx from 'clsx'

interface SortableItemProps {
  children: React.ReactNode
  id: string
  className?: string
  sortableData: {
    data: Asana
    index: number
    blockId: string
  }
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  onClick,
  sortableData
}) => {
  const {isMobile} = useSettings()

  const {attributes, listeners, setNodeRef, isDragging, transform, transition} =
    useSortable({
      id,
      data: sortableData
    })

  useEffect(() => {
    if (isDragging) {
      onMouseLeave()
    }
  }, [isDragging, onMouseLeave])

  return (
    <div
      ref={setNodeRef}
      className={clsx(styles.wrapper, className)}
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1
      }}
      {...(isMobile ? {onClick} : {onMouseEnter, onMouseLeave})}
      {...attributes}
      {...listeners}>
      {children}
    </div>
  )
}
