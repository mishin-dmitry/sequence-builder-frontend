import React, {useCallback, useEffect, useMemo, useRef} from 'react'

import type {Asana} from 'types'

import {Tooltip, Typography} from 'antd'
import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'
import {FileTextOutlined} from '@ant-design/icons'

import styles from './styles.module.css'
import clsx from 'clsx'
import {AsanaImage} from 'components/asana-image'

interface AsanaCardProps {
  data: Asana
  size?: 'default' | 'small'
  isButton?: boolean
  hideText?: boolean
  className?: string
  isAsanaSelected?: boolean
  hideAlignment?: boolean
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
  hideAlignment
}) => {
  const ref = useRef<any>(null)

  const {isDarkTheme} = useSettings()
  const {name, alias = '', alignment} = data

  const onAsanaClick = useCallback(() => {
    onAsanaClickProp?.(data)
  }, [data, onAsanaClickProp])

  useEffect(() => {
    if (isAsanaSelected) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [isAsanaSelected])

  const image = useMemo(
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
      onClick={onAsanaClick}>
      {image}
      {!hideText && (
        <div className={styles.textContainer}>
          {name && (
            <Typography.Title level={2} className={styles.title}>
              {name}
            </Typography.Title>
          )}
        </div>
      )}

      {!!alignment && !hideAlignment && (
        <Tooltip title={<span className={styles.tooltip}>{alignment}</span>}>
          <FileTextOutlined className={styles.icon} />
        </Tooltip>
      )}
    </TagName>
  )
}
