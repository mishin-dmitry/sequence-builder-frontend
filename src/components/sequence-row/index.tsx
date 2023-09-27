import React, {useCallback, useMemo} from 'react'
import type {Asana} from 'types'

import {imageSrc} from 'lib/image-src'
import {Input} from 'components/input'
import {Droppable, Draggable} from 'react-beautiful-dnd'
import styles from './styles.module.css'
import clsx from 'clsx'

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
  id,
  title,
  isEditing,
  onDeleteAsana,
  onChange,
  onClick: onClickProp,
  onDeleteSequence,
  index
}) => {
  const sequence = useMemo(() => {
    return data.map(({pk, image}, index) => {
      // Так как в одной последовательности может быть несколько
      // одинаковых асан, а id должен быть уникальным для каждой асаны
      const uniqueId = `asana-${pk}-${index}`

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
                key={pk}
                src={imageSrc(image)}
                alt="Изображение асаны"
              />
            </div>
          )}
        </Draggable>
      )
    })
  }, [data, onDeleteAsana])

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {value} = event.target

      onChange(value)
    },
    [onChange]
  )

  const droppable = useMemo(() => {
    return (
      <Droppable droppableId={id} direction="horizontal" type="sequence">
        {({innerRef, placeholder, droppableProps}) => (
          // {({innerRef, placeholder, droppableProps}, {isDraggingOver}) => (
          <div
            ref={innerRef}
            className={clsx(styles.sequence)}
            {...droppableProps}>
            {sequence}
            {placeholder}
          </div>
        )}
      </Droppable>
    )
  }, [id, sequence])

  const onClick = useCallback(() => onClickProp(id), [id, onClickProp])

  const onDoubleClick = useCallback(
    () => onDeleteSequence(id),
    [id, onDeleteSequence]
  )

  return (
    <Draggable draggableId={id} key={id} index={index}>
      {({draggableProps, dragHandleProps, innerRef}) => (
        <div
          className={clsx(styles.sequenceRow, isEditing && styles.editing)}
          onDoubleClick={onDoubleClick}
          ref={innerRef}
          onClick={onClick}
          {...dragHandleProps}
          {...draggableProps}>
          <Input
            placeholder="Введите заголовок..."
            onChange={onInputChange}
            className={styles.input}
            label="Заголовок"
            name="title"
            value={title}
          />
          {droppable}
        </div>
      )}
    </Draggable>
  )
}
