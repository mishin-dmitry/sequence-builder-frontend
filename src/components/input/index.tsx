import React from 'react'

import {Input as AntdInput, type InputProps as AntdInputProps} from 'antd'

import {Label} from 'components/label'

interface InputProps extends AntdInputProps {
  label?: string
  name: string
}

export const Input: React.FC<InputProps> = ({label, name, ...inputProps}) => {
  return (
    <>
      {!!label && <Label htmlFor={name}>{label}</Label>}
      <AntdInput {...inputProps} size="large" />
    </>
  )
}
