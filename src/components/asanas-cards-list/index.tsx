import React, {useMemo} from 'react'

import type {Asana} from 'types'
import {AsanaCard} from 'components/asana-card'
import {Typography} from 'antd'

import styles from './styles.module.css'
import clsx from 'clsx'
import {isMobile} from 'lib/is-mobile'

export interface AsanaCardsListProps {
  asanas: Asana[]
  size?: 'default' | 'small'
  className?: string
  withLinks?: boolean
  isMobile: boolean
  onAsanaClick?: (asana: Asana) => void
}

export const AsanaCardsList: React.FC<AsanaCardsListProps> = ({
  asanas = [],
  size,
  className,
  withLinks,
  isMobile,
  onAsanaClick
}) => {
  const list = useMemo(
    () => (
      <ul className={clsx(styles.list, isMobile && styles.mobile, className)}>
        {asanas.map((data: Asana) => (
          <AsanaCard
            data={data}
            key={data.id}
            isLink={withLinks}
            size={size}
            isMobile={isMobile}
            onAsanaClick={onAsanaClick}
          />
        ))}
      </ul>
    ),
    [asanas, className, isMobile, onAsanaClick, size, withLinks]
  )

  return asanas.length ? (
    list
  ) : (
    <Typography.Paragraph>Список пуст</Typography.Paragraph>
  )
}
