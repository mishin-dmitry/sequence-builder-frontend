import React, {useEffect} from 'react'

import {type SubmitHandler, useForm, Controller} from 'react-hook-form'

import {FormCard} from 'components/form-card'
import {Input} from 'components/input'
import {Button} from 'antd'
import {Textarea} from 'components/textarea'
import {Select} from 'components/select'

import styles from './styles.module.css'

export interface FeedbackFormInputs {
  email: string
  name: string
  topic: string
  text: string
}

interface FeedbackFormProps {
  onSubmit: (values: FeedbackFormInputs) => Promise<void>
}

const SELECT_OPTIONS = [
  {value: 'error', label: 'Ошибка'},
  {value: 'improvement', label: 'Предложение по улучшению'},
  {value: 'cooperation', label: 'Предложение о сотрудничестве'},
  {value: 'asana', label: 'Добавить асану'},
  {value: 'rest', label: 'Остальное'}
]

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit: onSubmitProp
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: {isSubmitting, isDirty, isValid, isSubmitSuccessful}
  } = useForm<FeedbackFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      name: '',
      text: ''
    }
  })

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitSuccessful])

  const onSubmit: SubmitHandler<FeedbackFormInputs> = async (data) => {
    await onSubmitProp(data)
  }

  return (
    <FormCard title="Обратная связь" className={styles.card}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          rules={{
            required: {
              value: true,
              message: 'Введите почту'
            },

            pattern: {
              value:
                /^[+a-zA-Z0-9_.!#$%&'*/=?^`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,63}$/,
              message: 'Введите корректный адрес почты'
            }
          }}
          control={control}
          render={({field, fieldState}) => (
            <Input
              {...field}
              label="Почта"
              placeholder="Введите почту..."
              errorMessage={fieldState.error?.message}
              autoComplete="username"
            />
          )}
        />
        <Controller
          name="name"
          rules={{
            required: {
              value: true,
              message: 'Введите ваше имя'
            }
          }}
          control={control}
          render={({field}) => (
            <Input {...field} label="Имя" placeholder="Введите ваше имя..." />
          )}
        />
        <Controller
          name="topic"
          control={control}
          rules={{
            required: {
              value: true,
              message: 'Выберите тему обращения'
            }
          }}
          render={({field}) => (
            <Select
              {...field}
              label="Тема обращения"
              placeholder="Выберите тему обращения..."
              options={SELECT_OPTIONS}
            />
          )}
        />
        <Controller
          name="text"
          control={control}
          rules={{
            required: {
              value: true,
              message: 'Введите текс обращения'
            }
          }}
          render={({field}) => (
            <Textarea
              {...field}
              label="Текст обращения"
              placeholder="Введите текст..."
              className={styles.textarea}
            />
          )}
        />
        <div className={styles.buttonWrapper}>
          <Button
            type="primary"
            loading={isSubmitting}
            htmlType="submit"
            disabled={!isDirty || !isValid}
            className={styles.button}>
            Отправить
          </Button>
        </div>
      </form>
    </FormCard>
  )
}
