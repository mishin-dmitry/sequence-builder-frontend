import React, {useMemo} from 'react'

import {FormCard} from 'components/form-card'
import {type SubmitHandler, useForm, Controller} from 'react-hook-form'
import {Input} from 'components/input'
import {Button} from 'antd'
import {Urls} from 'lib/urls'

import styles from './styles.module.css'
import Link from 'next/link'

export interface RequestResetPasswordFormInputs {
  email: string
}

interface RequestResetPasswordFormProps {
  onSubmit: (values: RequestResetPasswordFormInputs) => Promise<void>
}

export const RequestResetPasswordForm: React.FC<
  RequestResetPasswordFormProps
> = ({onSubmit: onSubmitProp}) => {
  const {
    control,
    handleSubmit,
    formState: {isSubmitting, isDirty, isValid, isLoading}
  } = useForm<RequestResetPasswordFormInputs>({
    mode: 'onBlur',
    defaultValues: {
      email: ''
    }
  })

  const onSubmit: SubmitHandler<RequestResetPasswordFormInputs> = async (
    data
  ) => {
    await onSubmitProp(data)
  }

  const footer = useMemo(
    () => (
      <Link href={Urls.REGISTRATION} as={Urls.REGISTRATION} shallow>
        Зарегистрироваться
      </Link>
    ),
    []
  )

  return (
    <FormCard title="Восстановление пароля" footer={footer}>
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
        <div className={styles.buttonWrapper}>
          <Button
            type="primary"
            loading={isSubmitting || isLoading}
            htmlType="submit"
            disabled={!isDirty || !isValid}
            className={styles.button}>
            Продолжить
          </Button>
        </div>
      </form>
    </FormCard>
  )
}
