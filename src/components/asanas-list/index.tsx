import React from 'react'

import type {Asana} from 'types'

import {AsanaCard} from 'components/asana-card'
import {Typography} from 'antd'
import {Spinner} from 'components/spinner'
import {useSettings} from 'context/settings'

import styles from './styles.module.css'
import clsx from 'clsx'

export interface AsanaCardsListProps {
  asanas: Asana[]
  size?: 'default' | 'small'
  className?: string
  withLinks?: boolean
  isLoading?: boolean
  selectedId?: number
  onAsanaClick?: (asana: Asana) => void
}

export const AsanasList: React.FC<AsanaCardsListProps> = ({
  asanas = [],
  size,
  className,
  isLoading,
  onAsanaClick,
  selectedId
}) => {
  const {isMobile} = useSettings()

  if (isLoading) {
    return <Spinner />
  }

  if (!asanas.length) {
    return (
      <div className={clsx(styles.list, styles.empty, className)}>
        <Typography.Paragraph>Список пуст</Typography.Paragraph>
      </div>
    )
  }

  return (
    <div className={styles.listWrapper}>
      <ul className={clsx(styles.list, className)}>
        {asanas.map((asana: Asana) => (
          <AsanaCard
            data={asana}
            key={asana.id}
            size={size}
            onAsanaClick={onAsanaClick}
            className={styles.asana}
            hideAlignment={isMobile}
            isAsanaSelected={asana.id === selectedId}
          />
        ))}
      </ul>
    </div>
  )
}
