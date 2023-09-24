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
  onDelete: (id: number) => void
  onChange: (title: string) => void
}

export const SequenceRow: React.FC<SequenceRowProps> = ({
  data = [],
  onDelete,
  onChange,
  id
}) => {
  const sequence = useMemo(() => {
    return data.map(({pk, image}, index) => {
      return (
        <Draggable
          index={index}
          draggableId={`asana-${pk}`}
          key={`asana-${pk}`}>
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

  return (
    <div className={styles.sequenceRow}>
      <Input
        placeholder="Введите заголовок..."
        onChange={onInputChange}
        className={styles.input}
        label="Заголовок"
        name="title"
      />
      {droppable}
      {/* <Droppable droppableId={id}>
        {({innerRef, placeholder, droppableProps}) => (
          <div ref={innerRef} className={styles.sequence} {...droppableProps}>
            {sequence}
            {placeholder}
          </div>
        )}
      </Droppable> */}
    </div>
  )
}
