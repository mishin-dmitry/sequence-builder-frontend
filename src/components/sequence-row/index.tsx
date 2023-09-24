import React, {useCallback, useMemo} from 'react'
import type {Asana} from 'types'

import styles from './styles.module.css'
import {imageSrc} from 'lib/image-src'
import {Button} from 'antd'
import {CloseOutlined} from '@ant-design/icons'
import {Input} from 'components/input'

interface SequenceRowProps {
  data: Asana[]
  title?: string
  onDelete: (id: number) => void
  onChange: (title: string) => void
}

export const SequenceRow: React.FC<SequenceRowProps> = ({
  data = [],
  onDelete,
  onChange
}) => {
  const sequence = useMemo(() => {
    return data.map(({pk, image}, index) => (
      <div className={styles.imageWrapper} key={index}>
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
    ))
  }, [data, onDelete])

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const {value} = event.target

      onChange(value)
    },
    [onChange]
  )

  return (
    <div className={styles.sequenceRow}>
      <Input
        placeholder="Введите заголовок..."
        onChange={onInputChange}
        className={styles.input}
        label="Заголовок"
        name="title"
      />
      <div className={styles.sequence}>{sequence}</div>
    </div>
  )
}
