import React from 'react'

import {FormCard} from 'components/form-card'
import {
  type SubmitHandler,
  useForm,
  Controller,
  UseFormSetError
} from 'react-hook-form'
import {Input} from 'components/input'
import {Button} from 'antd'

import styles from './styles.module.css'

export interface LoginFormInputs {
  email: string
  password: string
}

interface LoginFormProps {
  onSubmit: (
    values: LoginFormInputs,
    setError: UseFormSetError<LoginFormInputs>
  ) => Promise<void>
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit: onSubmitProp
}) => {
  const {
    control,
    handleSubmit,
    setError,
    formState: {isSubmitting, isDirty, isValid, isLoading}
  } = useForm<LoginFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    await onSubmitProp(data, setError)
  }

  return (
    <FormCard title="Войти">
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
            />
          )}
        />
        <Controller
          name="password"
          rules={{
            required: {
              value: true,
              message: 'Введите пароль'
            }
          }}
          control={control}
          render={({field, fieldState}) => (
            <Input
              {...field}
              label="Пароль"
              errorMessage={fieldState.error?.message}
              placeholder="Введите пароль..."
              type="password"
              asPassword
            />
          )}
        />
        <div className={styles.buttonWrapper}>
          <Button
            type="primary"
            loading={isSubmitting || isLoading}
            htmlType="submit"
            disabled={!isDirty || !isValid}
            className={styles.button}>
            Войти
          </Button>
        </div>
      </form>
    </FormCard>
  )
}
