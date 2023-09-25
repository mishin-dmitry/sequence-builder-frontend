import React, {useCallback, useMemo} from 'react'
import type {Asana} from 'types'

import {imageSrc} from 'lib/image-src'
import {Button} from 'antd'
import {CloseOutlined} from '@ant-design/icons'
import {Input} from 'components/input'
import {Droppable, Draggable} from 'react-beautiful-dnd'
import styles from './styles.module.css'
import clsx from 'clsx'

interface SequenceRowProps {
  data: Asana[]
  id: string
  title?: string
  isEditing?: boolean
  onDelete: (id: number) => void
  onChange: (title: string) => void
  onClick: (id: string) => void
}

export const SequenceRow: React.FC<SequenceRowProps> = ({
  data = [],
  id,
  isEditing,
  onDelete,
  onChange,
  onClick: onClickProp
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
              className={clsx(
                styles.imageWrapper,
                isDragging && styles.dragging
              )}
              ref={innerRef}
              {...draggableProps}
              {...dragHandleProps}>
              <img width={70} height={70} key={pk} src={imageSrc(image)} />
              <Button
                shape="circle"
                type="primary"
                size="small"
                danger
                icon={<CloseOutlined />}
                className={styles.deleteButton}
                onClick={() => onDelete(index)}
              />
            </div>
          )}
        </Draggable>
      )
    })
  }, [data, onDelete])

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {value} = event.target

      onChange(value)
    },
    [onChange]
  )

  const droppable = useMemo(() => {
    return (
      <Droppable droppableId={id} direction="horizontal">
        {({innerRef, placeholder, droppableProps}, {isDraggingOver}) => (
          <div
            ref={innerRef}
            className={clsx(styles.sequence, isDraggingOver && styles.active)}
            {...droppableProps}>
            {sequence}
            {placeholder}
          </div>
        )}
      </Droppable>
    )
  }, [id, sequence])

  const onClick = useCallback(() => onClickProp(id), [id, onClickProp])

  return (
    <div
      className={clsx(styles.sequenceRow, isEditing && styles.editing)}
      onClick={onClick}>
      <Input
        placeholder="Введите заголовок..."
        onChange={onInputChange}
        className={styles.input}
        label="Заголовок"
        name="title"
      />
      {droppable}
    </div>
  )
}
