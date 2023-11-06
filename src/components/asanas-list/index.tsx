import React from 'react'

import type {Asana} from 'types'

import {AsanaCard} from 'components/asana-card'
import {Typography} from 'antd'

import styles from './styles.module.css'
import clsx from 'clsx'

export interface AsanaCardsListProps {
  asanas: Asana[]
  size?: 'default' | 'small'
  className?: string
  withLinks?: boolean
  onAsanaClick?: (asana: Asana) => void
}

export const AsanasList: React.FC<AsanaCardsListProps> = ({
  asanas = [],
  size,
  className,
  onAsanaClick
}) => {
  if (!asanas.length) {
    return (
      <div className={clsx(styles.list, className)}>
        <Typography.Paragraph>Список пуст</Typography.Paragraph>
      </div>
    )
  }

  return (
    <ul className={clsx(styles.list, className)}>
      {asanas.map((asana: Asana) => (
        <AsanaCard
          data={asana}
          key={asana.id}
          size={size}
          onAsanaClick={onAsanaClick}
          className={styles.asana}
        />
      ))}
    </ul>
  )
}
