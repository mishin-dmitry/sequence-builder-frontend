import React from 'react'

import type {Asana} from 'types'

import {AsanaCard} from 'components/asana-card'
import {Typography} from 'antd'
import {Spinner} from 'components/spinner'

import styles from './styles.module.css'
import clsx from 'clsx'

export interface AsanaCardsListProps {
  asanas: Asana[]
  size?: 'default' | 'small'
  className?: string
  withLinks?: boolean
  isMobile: boolean
  isLoading?: boolean
  onAsanaClick?: (asana: Asana) => void
}

export const AsanasList: React.FC<AsanaCardsListProps> = ({
  asanas = [],
  size,
  className,
  isMobile,
  onAsanaClick,
  isLoading
}) => {
  if (isLoading) {
    return <Spinner />
  }

  if (!asanas.length) {
    return <Typography.Paragraph>Список пуст</Typography.Paragraph>
  }

  return (
    <ul className={clsx(styles.list, className)}>
      {asanas.map((asana: Asana) => (
        <AsanaCard
          data={asana}
          key={asana.id}
          size={size}
          isMobile={isMobile}
          onAsanaClick={onAsanaClick}
          className={isMobile ? styles.asana : undefined}
        />
      ))}
    </ul>
  )
}
