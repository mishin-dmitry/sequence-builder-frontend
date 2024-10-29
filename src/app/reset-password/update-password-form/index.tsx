import React, {useMemo} from 'react'

import {
  type SubmitHandler,
  useForm,
  Controller,
  UseFormSetError
} from 'react-hook-form'

import {FormCard} from 'components/form-card'
import {Input} from 'components/input'
import {Button} from 'antd'

import styles from './styles.module.css'

export interface UpdatePasswordFormInputs {
  password: string
  confirmPassword: string
}

interface ResetPasswordFormProps {
  onSubmit: (
    values: UpdatePasswordFormInputs,
    setError: UseFormSetError<UpdatePasswordFormInputs>
  ) => Promise<void>
}

export const UpdatePasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit: onSubmitProp
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: {isSubmitting, isDirty, isValid}
  } = useForm<UpdatePasswordFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const watchPassword = watch('password')

  const onSubmit: SubmitHandler<UpdatePasswordFormInputs> = async (data) => {
    await onSubmitProp(data, setError)
  }

  const passwordRules = useMemo(
    () => ({
      required: {
        value: true,
        message: 'Введите пароль'
      },
      minLength: {
        value: 7,
        message: 'Пароль должен состоять из 7 и более символов'
      }
    }),
    []
  )

  const confirmPasswordRules = useMemo(
    () => ({
      required: {
        value: true,
        message: 'Введите пароль'
      },
      validate: (value: string) => {
        if (watchPassword !== value) {
          return 'Введенные пароли не совпадают'
        }
      }
    }),
    [watchPassword]
  )

  return (
    <FormCard title="Обновление пароля">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          rules={passwordRules}
          control={control}
          render={({field, fieldState}) => (
            <Input
              {...field}
              label="Новый пароль"
              errorMessage={fieldState.error?.message}
              placeholder="Введите новый пароль..."
              type="password"
              asPassword
              autoComplete="new-password"
            />
          )}
        />
        <Controller
          name="confirmPassword"
          rules={confirmPasswordRules}
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
            Сохранить
          </Button>
        </div>
      </form>
    </FormCard>
  )
}
