import React from 'react'

import {Input as AntdInput, type InputProps as AntdInputProps} from 'antd'

import {Label} from 'components/label'

import styles from './styles.module.css'

interface InputProps extends AntdInputProps {
  label?: string
  name: string
  errorMessage?: string
  asPassword?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  name,
  errorMessage,
  asPassword,
  ...inputProps
}) => {
  const InputComponent = asPassword ? AntdInput.Password : AntdInput

  return (
    <div className={styles.inputWrapper}>
      {!!label && <Label htmlFor={name}>{label}</Label>}
      <InputComponent
        status={errorMessage ? 'error' : undefined}
        size="large"
        {...inputProps}
      />
      {!!errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </div>
  )
}
