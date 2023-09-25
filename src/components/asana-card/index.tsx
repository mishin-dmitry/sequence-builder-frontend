import React, {useCallback} from 'react'

import type {Asana} from 'types'

import {Typography} from 'antd'
import {imageSrc} from 'lib/image-src'

import styles from './styles.module.css'
import Link from 'next/link'
import clsx from 'clsx'

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
  const {name, image, description} = data

  const isDataExists = !!description || !!image || !!name

  const onAsanaClick = useCallback(() => {
    onAsanaClickProp?.(data)
  }, [data, onAsanaClickProp])

  if (!isDataExists) {
    return null
  }

  if (isLink && href) {
    return (
      <Link href={href} className={clsx(styles.card, styles.link)}>
        <div className={styles.imageContainer}>
          <img src={imageSrc(image as string)} />
        </div>
        <div>
          <Typography.Title level={2}>{name}</Typography.Title>
          {!!description && size === 'default' && (
            <Typography>{description}</Typography>
          )}
        </div>
      </Link>
    )
  }

  return (
    <button className={clsx(styles.card, styles[size])} onClick={onAsanaClick}>
      {image && (
        <div className={styles.imageContainer}>
          <img
            src={
              typeof image === 'string'
                ? imageSrc(image)
                : URL.createObjectURL(image as unknown as Blob)
            }
          />
        </div>
      )}
      <div>
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
