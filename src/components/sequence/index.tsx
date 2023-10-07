import React, {useMemo} from 'react'

import type {Asana} from 'types'
import {iconsMap} from 'icons'

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
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

import clsx from 'clsx'
import styles from './styles.module.css'

interface SequenceProps {
  data: Asana[]
  onDeleteAsana: (id: number) => void
  onDragEnd: (event: any) => void
}

export const Sequence: React.FC<SequenceProps> = ({
  data = [],
  onDeleteAsana,
  onDragEnd
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10
      }
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    }),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const sequence = useMemo(() => {
    return data.map(({id, alias}, index) => {
      const uniqueId = `${id}-${index}`

      return (
        <SortableItem key={index} id={uniqueId}>
          <div
            onDoubleClick={() => onDeleteAsana(index)}
            className={clsx(styles.imageWrapper)}>
            <img
              width={50}
              height={50}
              key={id}
              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                iconsMap[alias]
              )}`}
              alt="Изображение асаны"
            />
          </div>
        </SortableItem>
      )
    })
  }, [data, onDeleteAsana])

  const sortableContextItems = useMemo(
    () => data.map(({id}, index) => `${id}-${index}`),
    [data]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}>
      <SortableContext
        items={sortableContextItems}
        strategy={rectSortingStrategy}>
        <div className={styles.sequenceRow}>
          <div className={styles.sequence}>{sequence}</div>
        </div>
      </SortableContext>
    </DndContext>
  )
}
