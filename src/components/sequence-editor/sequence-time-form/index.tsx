import React from 'react'

import {Row, TimePicker} from 'antd'
import {type SubmitHandler, useForm, Controller} from 'react-hook-form'

import styles from './styles.module.css'
import {type Dayjs} from 'dayjs'

export interface TimeSettingsFormInputs {
  pranayamaTime: Dayjs
  warmUpTime: Dayjs
  namaskarTime: Dayjs
  asanaTime: Dayjs
  shavasanaTime: Dayjs
}

const INPUTS = [
  {name: 'pranayamaTime', label: 'Пранаяма'},
  {name: 'warmUpTime', label: 'Разминка'},
  {name: 'namaskarTime', label: 'Сурья Намаскар'},
  {name: 'asanaTime', label: 'Удержание асаны'},
  {name: 'shavasanaTime', label: 'Шавасана'}
]

interface SequenceTimeFormProps {
  onSubmit: (data: TimeSettingsFormInputs) => void
  footerButtons: React.ReactNode
  defaultValues: TimeSettingsFormInputs
}

export const SequenceTimeForm: React.FC<SequenceTimeFormProps> = ({
  onSubmit: onSubmitProp,
  defaultValues,
  footerButtons
}) => {
  const {control, handleSubmit} = useForm<TimeSettingsFormInputs>({
    defaultValues
  })

  const onSubmit: SubmitHandler<TimeSettingsFormInputs> = (data) => {
    onSubmitProp(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {INPUTS.map(({label, name}) => (
        <Controller
          key={label}
          name={name as keyof TimeSettingsFormInputs}
          control={control}
          render={({field}) => (
            <Row className={styles.row}>
              <span className={styles.text}>{label}</span>
              <TimePicker
                {...field}
                format="mm:ss"
                showNow={false}
                placeholder="Время"
                size="small"
              />
            </Row>
          )}
        />
      ))}
      <div className={styles.buttonsWrapper}>{footerButtons}</div>
    </form>
  )
}
