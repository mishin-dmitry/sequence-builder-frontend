import React, {useCallback, useMemo} from 'react'

import type {Asana as TAsana} from 'types'

import {
  AnimateLayoutChanges,
  SortableContext,
  defaultAnimateLayoutChanges,
  useSortable
} from '@dnd-kit/sortable'

import {CSS} from '@dnd-kit/utilities'

import {DragOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {ConfirmButton} from 'components/confirm-button'
import {useSettings} from 'context/settings'
import {Asana} from 'components/asana'
import {Action, Target} from 'components/sequence-editor'
import {BlockType} from 'components/pdf-viewer/utils'

import clsx from 'clsx'
import styles from './styles.module.css'

interface SequenceProps {
  data: (TAsana & {count?: number})[]
  id: string
  isEditing: boolean
  target?: Target
  className?: string
  onDeleteAsana: (id: number, blockId: string) => void
  onDeleteBlock?: (id: string) => void
  addAsanaToBlock: (
    id: number,
    block: BlockType.REPEATING | BlockType.DYNAMIC,
    action: Action,
    blockId: string
  ) => void
  onAddAsanaButtonClick?: () => void
  scrollToAsana: (id: number) => void
  copyAsana: (asana: TAsana, index: number, blockId: string) => void
}

const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const {isSorting, wasDragging} = args

  if (isSorting || wasDragging) {
    return defaultAnimateLayoutChanges(args)
  }

  return true
}

export const Sequence: React.FC<SequenceProps> = ({
  data = [],
  id: blockId,
  onAddAsanaButtonClick,
  addAsanaToBlock: addAsanaToBlockProp,
  onDeleteAsana: onDeleteAsanaProp,
  onDeleteBlock: onDeleteBlockProp,
  isEditing,
  copyAsana,
  scrollToAsana,
  className,
  target
}) => {
  const {isMobile} = useSettings()

  const {setNodeRef, attributes, listeners, transform, transition, isDragging} =
    useSortable({
      id: blockId,
      data: {
        type: 'Block',
        data
      },
      animateLayoutChanges
    })

  const onDeleteBlock = useCallback(
    () => (onDeleteBlockProp as (id: string) => void)(blockId),
    [onDeleteBlockProp, blockId]
  )

  const onDeleteAsana = useCallback(
    (asanaId: number) => {
      onDeleteAsanaProp(asanaId, blockId)
    },
    [onDeleteAsanaProp, blockId]
  )

  const addAsanaToBlock = useCallback(
    (
      asanaId: number,
      block: BlockType.REPEATING | BlockType.DYNAMIC,
      action: Action
    ) => {
      addAsanaToBlockProp(asanaId, block, action, blockId)
    },
    [addAsanaToBlockProp, blockId]
  )
  const items = useMemo(
    () => data.map(({id}) => `${blockId}.${id}.${Math.random()}`),
    [blockId, data]
  )

  return (
    <div
      className={clsx(styles.sequenceRow, isEditing && styles.editing)}
      style={{
        transition,
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1
      }}
      ref={setNodeRef}>
      {target === Target.SEQUENCE && (
        <DragOutlined className={styles.drag} {...attributes} {...listeners} />
      )}
      <div className={clsx(styles.sequence, className)}>
        <SortableContext items={items}>
          {data.map((asana, index) => {
            const key = items[index]

            return (
              <Asana
                key={key}
                id={key}
                asana={asana}
                index={index}
                blockId={blockId}
                copyAsana={copyAsana}
                onDeleteAsana={onDeleteAsana}
                scrollToAsana={scrollToAsana}
                addAsanaToBlock={addAsanaToBlock}
                isBlockButtonsHidden={target === Target.BUNCH}
              />
            )
          })}
        </SortableContext>
        {isMobile && (
          <button className={styles.addButton} onClick={onAddAsanaButtonClick}>
            <PlusCircleOutlined />
          </button>
        )}
      </div>
      {onDeleteBlockProp && (
        <div className={styles.buttonWrapper}>
          <ConfirmButton
            okText="Удалить"
            title="Удалить блок асан"
            description="Вы действительно хотите удалить блок асан?"
            onClick={onDeleteBlock}>
            Удалить блок асан
          </ConfirmButton>
        </div>
      )}
    </div>
  )
}
