import React from 'react'

import type {Asana, AsanaBunch as TAsanaBunch} from 'types'

import {Typography} from 'antd'
import {Spinner} from 'components/spinner'
import {Urls} from 'lib/urls'
import {AsanaBunch} from 'components/asanas-bunch'
import {useAsanasBunches} from 'context/asanas-bunches'

import styles from './styles.module.css'
import clsx from 'clsx'
import Link from 'next/link'

export interface AsanaCardsListProps {
  asanasBunches: TAsanaBunch[]
  className?: string
  onAsanasBunchClick: (asanas: Asana[]) => void
}

export const AsanasBunchesList: React.FC<AsanaCardsListProps> = ({
  asanasBunches = [],
  className,
  onAsanasBunchClick
}) => {
  const {isLoading} = useAsanasBunches()

  if (isLoading) {
    return <Spinner />
  }

  if (!asanasBunches.length) {
    return (
      <div className={clsx(styles.list, styles.empty, className)}>
        <Typography.Paragraph>
          Список пуст...{' '}
          <Link href={Urls.CREATE_ASANAS_BUNCH}>создать связку асан</Link>
        </Typography.Paragraph>
      </div>
    )
  }

  return (
    <div className={styles.listWrapper}>
      <ul className={clsx(styles.list, className)}>
        {asanasBunches.map(({id, title, asanas}: TAsanaBunch) => (
          <AsanaBunch
            asanas={asanas}
            key={id}
            title={title}
            onClick={onAsanasBunchClick}
          />
        ))}
      </ul>
    </div>
  )
}
