'use client'

import React, {useMemo} from 'react'

import type {Asana} from 'types'
import {iconsMap} from 'icons'

import {
  DndContext,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core'

import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'

import {SortableItem} from 'components/sortable-item'
import {PlusCircleOutlined} from '@ant-design/icons'
import {KeyboardSensor, MouseSensor, PointerSensor} from 'lib/sensors'

import clsx from 'clsx'
import styles from './styles.module.css'

interface SequenceProps {
  data: Asana[]
  isMobile?: boolean
  onDeleteAsana: (id: number) => void
  onDragEnd: (event: any) => void
  onAddAsanaButtonClick?: () => void
}

export const Sequence: React.FC<SequenceProps> = ({
  data = [],
  isMobile,
  onDeleteAsana,
  onDragEnd,
  onAddAsanaButtonClick
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10,
        delay: 100
      }
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 100,
        tolerance: 5
      }
    }),
    useSensor(PointerSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 100,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const sequence = useMemo(() => {
    return (
      <div className={clsx(styles.sequenceRow, isMobile && styles.mobile)}>
        <div className={styles.sequence}>
          {data.map(({id, alias}, index) => {
            const uniqueId = `${id}-${index}`

            return (
              <SortableItem
                key={index}
                id={uniqueId}
                index={index}
                onDelete={onDeleteAsana}
                isMobile={isMobile}
                className={styles.sortableWrapper}>
                <div className={clsx(styles.imageWrapper)}>
                  <img
                    width={70}
                    height={70}
                    key={id}
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(
                      iconsMap[alias]
                    )}`}
                    alt="Изображение асаны"
                  />
                </div>
              </SortableItem>
            )
          })}
          {isMobile && (
            <button
              className={styles.addButton}
              onClick={onAddAsanaButtonClick}>
              <PlusCircleOutlined />
            </button>
          )}
        </div>
      </div>
    )
  }, [isMobile, data, onAddAsanaButtonClick, onDeleteAsana])

  const sortableContextItems = useMemo(
    () => data.map(({id}, index) => `${id}-${index}`),
    [data]
  )

  if (!data.length && !isMobile) return null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}>
      <SortableContext
        items={sortableContextItems}
        strategy={rectSortingStrategy}>
        {sequence}
      </SortableContext>
    </DndContext>
  )
}
