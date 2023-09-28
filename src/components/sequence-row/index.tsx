import React, {useCallback, useMemo} from 'react'
import type {Asana} from 'types'

import {imageSrc} from 'lib/image-src'
import {Input} from 'components/input'
import {Droppable, Draggable} from 'react-beautiful-dnd'
import styles from './styles.module.css'
import clsx from 'clsx'
import {Button} from 'antd'

interface SequenceRowProps {
  data: Asana[]
  id: string
  index: number
  title?: string
  isEditing?: boolean
  onDeleteAsana: (id: number) => void
  onChange: (title: string) => void
  onClick: (id: string) => void
  onDeleteSequence: (id: string) => void
}

export const SequenceRow: React.FC<SequenceRowProps> = ({
  data = [],
  id: rowId,
  title,
  isEditing,
  onDeleteAsana,
  onChange,
  onClick: onClickProp,
  onDeleteSequence,
  index
}) => {
  const sequence = useMemo(() => {
    return data.map(({id, image}, index) => {
      // Так как в разныз блоках последовательности может быть несколько
      // одинаковых асан, а id должен быть уникальным для каждой асаны
      const uniqueId = `asana-${id}-${rowId}-${index}`

      return (
        <Draggable index={index} draggableId={uniqueId} key={uniqueId}>
          {({draggableProps, dragHandleProps, innerRef}, {isDragging}) => (
            <div
              onDoubleClick={() => onDeleteAsana(index)}
              className={clsx(
                styles.imageWrapper,
                isDragging && styles.dragging
              )}
              ref={innerRef}
              {...draggableProps}
              {...dragHandleProps}>
              <img
                width={50}
                height={50}
                key={id}
                src={imageSrc(image)}
                alt="Изображение асаны"
              />
            </div>
          )}
        </Draggable>
      )
    })
  }, [data, onDeleteAsana, rowId])

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {value} = event.target

      onChange(value)
    },
    [onChange]
  )

  const droppable = useMemo(() => {
    return (
      <Droppable droppableId={rowId} direction="horizontal" type="sequence">
        {({innerRef, placeholder, droppableProps}) => (
          <div ref={innerRef} className={styles.sequences} {...droppableProps}>
            {sequence}
            {placeholder}
          </div>
        )}
      </Droppable>
    )
  }, [rowId, sequence])

  const onClick = useCallback(() => onClickProp(rowId), [rowId, onClickProp])

  const onButtonClick = useCallback(
    () => onDeleteSequence(rowId),
    [rowId, onDeleteSequence]
  )

  return (
    <Draggable draggableId={rowId} key={rowId} index={index}>
      {({draggableProps, dragHandleProps, innerRef}) => (
        <div
          className={clsx(styles.sequenceRow, isEditing && styles.editing)}
          ref={innerRef}
          onClick={onClick}
          {...dragHandleProps}
          {...draggableProps}>
          <Input
            placeholder="Введите название блока асан..."
            onChange={onInputChange}
            className={styles.input}
            label="Блок асан"
            name="title"
            value={title}
          />
          {droppable}
          <div className={styles.buttonWrapper}>
            <Button danger type="primary" onClick={onButtonClick} size="middle">
              Удалить блок
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  )
}
