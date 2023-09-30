import React, {useCallback} from 'react'

import type {Asana} from 'types'

import {Typography} from 'antd'

import styles from './styles.module.css'
import Link from 'next/link'
import clsx from 'clsx'
import {isMobile as _isMobile} from 'lib/is-mobile'
import {iconsMap} from 'icons'

interface AsanaCardProps {
  data: Asana
  isLink?: boolean
  href?: string
  size?: 'default' | 'small'
  onAsanaClick?: (asana: Asana) => void
}

export const AsanaCard: React.FC<AsanaCardProps> = ({
  data,
  isLink,
  href,
  onAsanaClick: onAsanaClickProp,
  size = 'default'
}) => {
  const {name, alias = '', description} = data

  const isDataExists = !!description || !!alias || !!name
  const isMobile = _isMobile()

  const onAsanaClick = useCallback(() => {
    onAsanaClickProp?.(data)
  }, [data, onAsanaClickProp])

  if (!isDataExists) {
    return null
  }

  if (isLink && href) {
    return (
      <Link
        href={href}
        className={clsx(styles.card, styles.link, isMobile && styles.mobile)}>
        {iconsMap[alias] && (
          <div className={styles.imageContainer}>
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                iconsMap[alias]
              )}`}
            />
          </div>
        )}
        <div className={styles.textContainer}>
          <Typography.Title level={2}>{name}</Typography.Title>
          {!!description && size === 'default' && (
            <Typography>{description}</Typography>
          )}
        </div>
      </Link>
    )
  }

  return (
    <button
      className={clsx(styles.card, styles[size], isMobile && styles.mobile)}
      onClick={onAsanaClick}>
      {iconsMap[alias] && (
        <div className={styles.imageContainer}>
          <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(
              iconsMap[alias]
            )}`}
          />
        </div>
      )}
      <div className={styles.textContainer}>
        {name && (
          <Typography.Title level={2} className={styles.title}>
            {name}
          </Typography.Title>
        )}
        {!!description && size === 'default' && (
          <Typography>{description}</Typography>
        )}
      </div>
    </button>
  )
}
