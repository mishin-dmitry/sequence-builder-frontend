import React, {useMemo} from 'react'

import type {Asana} from 'types'
import {AsanaCard} from 'components/asana-card'
import {Typography} from 'antd'

import styles from './styles.module.css'
import clsx from 'clsx'

export interface AsanaCardsListProps {
  asanas: Asana[]
  size?: 'default' | 'small'
  className?: string
  onAsanaClick?: (asana: Asana) => void
  withLinks?: boolean
}

export const AsanaCardsList: React.FC<AsanaCardsListProps> = ({
  asanas = [],
  size,
  className,
  onAsanaClick,
  withLinks
}) => {
  const list = useMemo(
    () => (
      <ul className={clsx(styles.list, className)}>
        {asanas.map((data: Asana) => (
          <AsanaCard
            data={data}
            key={data.id}
            isLink={withLinks}
            size={size}
            onAsanaClick={onAsanaClick}
          />
        ))}
      </ul>
    ),
    [asanas, className, onAsanaClick, size, withLinks]
  )

  return asanas.length ? (
    list
  ) : (
    <Typography.Paragraph>Список пуст</Typography.Paragraph>
  )
}
