import React, {useEffect, useMemo, useRef} from 'react'

import type {Asana} from 'types'

import {Tooltip, Typography} from 'antd'
import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'
import {FileImageOutlined} from '@ant-design/icons'
import {AsanaImage} from 'components/asana-image'

import styles from './styles.module.css'
import clsx from 'clsx'

interface AsanaCardProps {
  data: Asana
  size?: 'default' | 'small'
  isButton?: boolean
  hideText?: boolean
  className?: string
  isAsanaSelected?: boolean
  isMobile?: boolean
  onAsanaClick?: (asana: Asana) => void
}

export const AsanaCard: React.FC<AsanaCardProps> = ({
  data,
  onAsanaClick: onAsanaClickProp,
  size = 'default',
  hideText,
  isButton = true,
  className,
  isAsanaSelected,
  isMobile
}) => {
  const ref = useRef<HTMLButtonElement & HTMLDivElement>(null)

  const {isDarkTheme} = useSettings()
  const {name, alias = '', image} = data

  useEffect(() => {
    if (isAsanaSelected) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [isAsanaSelected])

  const icon = useMemo(
    () =>
      iconsMap[alias] && (
        <div className={styles.imageContainer}>
          <AsanaImage isLazy alias={alias} isDarkTheme={isDarkTheme} />
        </div>
      ),
    [alias, isDarkTheme]
  )

  const TagName = isButton ? 'button' : 'div'

  return (
    <TagName
      ref={ref}
      className={clsx(
        styles.card,
        styles[size],
        (alias === 'empty' || alias === 'separator') && styles.empty,
        className
      )}
      onClick={
        isButton && onAsanaClickProp ? () => onAsanaClickProp(data) : undefined
      }>
      {icon}
      {!hideText && (
        <div className={styles.textContainer}>
          {name && (
            <Typography.Title level={2} className={styles.title}>
              {name}
            </Typography.Title>
          )}
        </div>
      )}

      {!!image && (
        <Tooltip
          trigger={isMobile ? 'click' : 'hover'}
          title={
            <div className={styles.imageWrapper}>
              <img
                alt={`Изображение асаны ${name}`}
                src={image}
                className={styles.image}
                loading="lazy"
              />
            </div>
          }>
          <FileImageOutlined className={styles.icon} />
        </Tooltip>
      )}
    </TagName>
  )
}
