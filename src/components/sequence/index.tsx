import React, {useCallback, useMemo} from 'react'

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
import {ConfirmButton} from 'components/confirm-button'

import clsx from 'clsx'
import styles from './styles.module.css'

interface SequenceProps {
  data: Asana[]
  isMobile?: boolean
  id: string
  isEditing: boolean
  onDeleteAsana: (id: number, blockId: string) => void
  onDeleteBlock: (id: string) => void
  addAsanaToRepeatingBlock: (
    id: number,
    action: 'add' | 'delete',
    blockId: string
  ) => void
  onDragEnd: (event: any) => void
  onDragStart: (event: any) => void
  onAddAsanaButtonClick?: () => void
}

export const Sequence: React.FC<SequenceProps> = ({
  data = [],
  isMobile,
  id,
  onDragEnd,
  onDragStart,
  onAddAsanaButtonClick,
  addAsanaToRepeatingBlock: addAsanaToRepeatingBlockProp,
  onDeleteAsana: onDeleteAsanaProp,
  onDeleteBlock: onDeleteBlockProp,
  isEditing
}) => {
  const onDeleteBlock = useCallback(
    () => onDeleteBlockProp(id),
    [onDeleteBlockProp, id]
  )

  const onDeleteAsana = useCallback(
    (asanaId: number) => {
      onDeleteAsanaProp(asanaId, id)
    },
    [onDeleteAsanaProp, id]
  )

  const addAsanaToRepeatingBlock = useCallback(
    (asanaId: number, action: 'add' | 'delete') => {
      addAsanaToRepeatingBlockProp(asanaId, action, id)
    },
    [addAsanaToRepeatingBlockProp, id]
  )

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
      <div
        className={clsx(
          styles.sequenceRow,
          isMobile && styles.mobile,
          isEditing && styles.editing
        )}>
        <div className={styles.sequence}>
          {data.map(({id, alias, isAsanaInRepeatingBlock}, index) => {
            const uniqueId = `${id}-${index}`

            return (
              <SortableItem
                key={index}
                id={uniqueId}
                index={index}
                onDelete={onDeleteAsana}
                isMobile={isMobile}
                isAsanaInRepeatingBlock={isAsanaInRepeatingBlock}
                addAsanaToRepeatingBlock={addAsanaToRepeatingBlock}
                className={styles.sortableWrapper}>
                <div className={clsx(styles.imageWrapper)}>
                  {iconsMap[alias] && (
                    <img
                      width={70}
                      height={70}
                      key={id}
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(
                        iconsMap[alias]
                      )}`}
                      alt="Изображение асаны"
                    />
                  )}
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
        <div className={styles.buttonWrapper}>
          <ConfirmButton
            okText="Удалить"
            title="Удалить блок асан"
            description="Вы действительно хотите удалить блок асан?"
            onClick={onDeleteBlock}>
            Удалить блок асан
          </ConfirmButton>
        </div>
      </div>
    )
  }, [
    isMobile,
    isEditing,
    data,
    onAddAsanaButtonClick,
    onDeleteBlock,
    onDeleteAsana,
    addAsanaToRepeatingBlock
  ])

  const sortableContextItems = useMemo(
    () => data.map(({id}, index) => `${id}-${index}`),
    [data]
  )

  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}>
      <SortableContext
        id={id}
        items={sortableContextItems}
        strategy={rectSortingStrategy}>
        {sequence}
      </SortableContext>
    </DndContext>
  )
}
