import React, {forwardRef} from 'react'

import {Select as AntdSelect, type SelectProps as AntdSelectProps} from 'antd'

import {Label} from 'components/label'

import styles from './styles.module.css'

interface SelectProps extends AntdSelectProps {
  label?: string
  name: string
  errorMessage?: string
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({label, name, errorMessage, ...selectProps}, ref) => {
    return (
      <div className={styles.selectWrapper} ref={ref}>
        {!!label && <Label htmlFor={name}>{label}</Label>}
        <AntdSelect
          status={errorMessage ? 'error' : undefined}
          size="large"
          {...selectProps}
        />
        {!!errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
