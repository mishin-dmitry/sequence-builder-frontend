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
import {Button} from 'antd'
import {useTheme} from 'context/theme'

import clsx from 'clsx'
import styles from './styles.module.css'

interface SequenceProps {
  data: (Asana & {count?: number})[]
  isMobile?: boolean
  id: string
  isEditing: boolean
  onDeleteAsana: (id: number, blockId: string) => void
  onDeleteBlock: (id: string) => void
  addAsanaToBlock: (
    id: number,
    block: 'repeating' | 'dynamic',
    action: 'add' | 'delete',
    blockId: string
  ) => void
  onDragEnd: (event: any) => void
  onDragStart: (event: any) => void
  onAddAsanaButtonClick?: () => void
  copyAsana: (asana: Asana, index: number, blockId: string) => void
}

export const Sequence: React.FC<SequenceProps> = ({
  data = [],
  isMobile,
  id,
  onDragEnd,
  onDragStart,
  onAddAsanaButtonClick,
  addAsanaToBlock: addAsanaToBlockProp,
  onDeleteAsana: onDeleteAsanaProp,
  onDeleteBlock: onDeleteBlockProp,
  isEditing,
  copyAsana
}) => {
  const {isDarkTheme} = useTheme()

  const onDeleteBlock = useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation()

      onDeleteBlockProp(id)
    },
    [onDeleteBlockProp, id]
  )

  const onDeleteAsana = useCallback(
    (asanaId: number) => {
      onDeleteAsanaProp(asanaId, id)
    },
    [onDeleteAsanaProp, id]
  )

  const addAsanaToBlock = useCallback(
    (
      asanaId: number,
      block: 'repeating' | 'dynamic',
      action: 'add' | 'delete'
    ) => {
      addAsanaToBlockProp(asanaId, block, action, id)
    },
    [addAsanaToBlockProp, id]
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
      <div className={clsx(styles.sequenceRow, isEditing && styles.editing)}>
        <div className={styles.sequence}>
          {data.map((asana, index) => {
            const {
              id: asanaId,
              alias,
              isAsanaInRepeatingBlock,
              isAsanaInDynamicBlock,
              count
            } = asana

            const uniqueId = `${asanaId}-${index}`

            return (
              <SortableItem
                key={index}
                id={uniqueId}
                index={index}
                count={count}
                onDelete={onDeleteAsana}
                isMobile={isMobile}
                isAsanaInRepeatingBlock={isAsanaInRepeatingBlock}
                isAsanaInDynamicBlock={isAsanaInDynamicBlock}
                addAsanasToBlock={addAsanaToBlock}
                copyAsana={() => copyAsana(asana, index, id)}
                className={styles.sortableWrapper}>
                <div
                  className={clsx(
                    styles.imageWrapper,
                    (alias === 'empty' || alias === 'separator') && styles.empty
                  )}>
                  {iconsMap[alias] && (
                    <img
                      width={70}
                      height={70}
                      key={id}
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(
                        iconsMap[alias].replaceAll(
                          '$COLOR',
                          isDarkTheme
                            ? 'rgba(255, 255, 255, 0.85)'
                            : 'rgba(0, 0, 0, 0.88)'
                        )
                      )}`}
                      alt="Изображение асаны"
                    />
                  )}
                  {alias === 'empty' && <span>Пустое место</span>}
                  {alias === 'separator' && <span>Разделитель</span>}
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
          <Button danger onClick={onDeleteBlock}>
            Удалить блок асан
          </Button>
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
    addAsanaToBlock,
    id,
    isDarkTheme,
    copyAsana
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
