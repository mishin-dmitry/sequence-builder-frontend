import React from 'react'

import {Input as AntdInput} from 'antd'

import type {TextAreaProps as AntdTextAreaProps} from 'antd/es/input'

import {Label} from 'components/label'

interface TextareaProps extends AntdTextAreaProps {
  label?: string
  name: string
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  name,
  className,
  ...textareaProps
}) => {
  return (
    <div className={className}>
      {!!label && <Label htmlFor={name}>{label}</Label>}
      <AntdInput.TextArea {...textareaProps} size="large" />
    </div>
  )
}
