import React, {useMemo} from 'react'

import {FormCard} from 'components/form-card'
import {
  type SubmitHandler,
  useForm,
  Controller,
  UseFormSetError
} from 'react-hook-form'
import {Input} from 'components/input'
import {Button} from 'antd'
import {Urls} from 'lib/urls'

import styles from './styles.module.css'
import Link from 'next/link'

export interface RegistrationFormInputs {
  email: string
  password: string
  confirmPassword: string
}

interface RegistrationFormProps {
  onSubmit: (
    values: RegistrationFormInputs,
    setError: UseFormSetError<RegistrationFormInputs>
  ) => Promise<void>
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit: onSubmitProp
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: {isSubmitting, isDirty, isValid}
  } = useForm<RegistrationFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit: SubmitHandler<RegistrationFormInputs> = async (data) => {
    await onSubmitProp(data, setError)
  }

  const footer = useMemo(
    () => (
      <Link href={Urls.LOGIN} as={Urls.LOGIN} shallow>
        Уже зарегистрирован
      </Link>
    ),
    []
  )

  return (
    <FormCard title="Регистрация" footer={footer}>
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
          name="password"
          rules={{
            required: {
              value: true,
              message: 'Введите пароль'
            },
            minLength: {
              value: 7,
              message: 'Пароль должен состоять из 7 и более символов'
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
              autoComplete="new-password"
            />
          )}
        />
        <Controller
          name="confirmPassword"
          rules={{
            required: {
              value: true,
              message: 'Введите пароль'
            },
            validate: (value: string) => {
              if (watch('password') !== value) {
                return 'Введенные пароли не совпадают'
              }
            }
          }}
          control={control}
          render={({field, fieldState}) => (
            <Input
              {...field}
              placeholder="Повторите пароль..."
              label="Повторите пароль"
              errorMessage={fieldState.error?.message}
              type="password"
              asPassword
              autoComplete="new-password"
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
            Зарегистрироваться
          </Button>
        </div>
      </form>
    </FormCard>
  )
}
