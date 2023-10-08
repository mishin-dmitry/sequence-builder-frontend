import React, {useMemo} from 'react'

import type {Asana} from 'types'

import {AsanaCard} from 'components/asana-card'
import {Input, Typography} from 'antd'

import styles from './styles.module.css'
import clsx from 'clsx'
import dynamic from 'next/dynamic'

export interface AsanaCardsListProps {
  asanas: Asana[]
  size?: 'default' | 'small'
  className?: string
  withLinks?: boolean
  isMobile: boolean
  onAsanaClick?: (asana: Asana) => void
  onSearchAsana: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const AsanasList: React.FC<AsanaCardsListProps> = ({
  asanas = [],
  size,
  className,
  isMobile,
  onAsanaClick,
  onSearchAsana
}) => {
  const list = useMemo(() => {
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
  }, [asanas, className, isMobile, onAsanaClick, size])

  return (
    <div className={clsx(styles.listWrapper, isMobile && styles.mobile)}>
      <div className={styles.searchWrapper}>
        <Input
          name="search"
          placeholder="Найти асану..."
          allowClear
          onChange={onSearchAsana}
        />
      </div>
      {list}
    </div>
  )
}

export default dynamic(() => Promise.resolve(AsanasList), {
  ssr: false
})
