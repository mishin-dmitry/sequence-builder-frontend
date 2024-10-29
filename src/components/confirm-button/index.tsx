import React from 'react'

import {Button, Popconfirm} from 'antd'

interface ConfirmButtonProps {
  title: string
  description: string
  okText: string
  size?: 'small' | 'large'
  block?: boolean
  disabled?: boolean
  children: React.ReactNode
  className?: string
  onClick: () => void
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
  children,
  title,
  description,
  block,
  disabled,
  size,
  onClick,
  className,
  okText
}) => (
  <Popconfirm
    title={title}
    description={description}
    okText={okText}
    className={className}
    onConfirm={onClick}
    cancelText="Отмена">
    <Button size={size} block={block} danger disabled={disabled}>
      {children}
    </Button>
  </Popconfirm>
)
