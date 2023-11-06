import React, {useCallback, useMemo} from 'react'

import type {Asana} from 'types'

import {Typography} from 'antd'
import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'

import styles from './styles.module.css'
import clsx from 'clsx'

interface AsanaCardProps {
  data: Asana
  size?: 'default' | 'small'
  isButton?: boolean
  hideText?: boolean
  className?: string
  onAsanaClick?: (asana: Asana) => void
}

export const AsanaCard: React.FC<AsanaCardProps> = ({
  data,
  onAsanaClick: onAsanaClickProp,
  size = 'default',
  hideText,
  isButton = true,
  className
}) => {
  const {isDarkTheme} = useSettings()
  const {name, alias = '', description} = data

  const onAsanaClick = useCallback(() => {
    onAsanaClickProp?.(data)
  }, [data, onAsanaClickProp])

  const image = useMemo(
    () =>
      iconsMap[alias] && (
        <div className={styles.imageContainer}>
          <img
            alt="Изображение асаны"
            loading="lazy"
            src={`data:image/svg+xml;utf8,${encodeURIComponent(
              iconsMap[alias].replaceAll(
                '$COLOR',
                isDarkTheme
                  ? 'rgba(255, 255, 255, 0.85)'
                  : 'rgba(0, 0, 0, 0.88)'
              )
            )}`}
          />
        </div>
      ),
    [alias, isDarkTheme]
  )

  const TagName = isButton ? 'button' : 'div'

  return (
    <TagName
      className={clsx(
        styles.card,
        styles[size],
        (alias === 'empty' || alias === 'separator') && styles.empty,
        className
      )}
      onClick={onAsanaClick}>
      {image}
      {!hideText && (
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
      )}
    </TagName>
  )
}
