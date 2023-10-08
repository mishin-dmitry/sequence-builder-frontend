import React, {useCallback, useMemo} from 'react'

import type {Asana} from 'types'

import {Typography} from 'antd'
import {isMobile as _isMobile} from 'lib/is-mobile'
import {iconsMap} from 'icons'

import styles from './styles.module.css'
import clsx from 'clsx'

interface AsanaCardProps {
  data: Asana
  size?: 'default' | 'small'
  isButton?: boolean
  hideText?: boolean
  isMobile: boolean
  className?: string
  onAsanaClick?: (asana: Asana) => void
}

export const AsanaCard: React.FC<AsanaCardProps> = ({
  data,
  onAsanaClick: onAsanaClickProp,
  size = 'default',
  isMobile,
  hideText,
  isButton = true,
  className
}) => {
  const {name, alias = '', description} = data

  const onAsanaClick = useCallback(() => {
    onAsanaClickProp?.(data)
  }, [data, onAsanaClickProp])

  const image = useMemo(
    () =>
      iconsMap[alias] && (
        <div className={styles.imageContainer}>
          <img
            loading="lazy"
            src={`data:image/svg+xml;utf8,${encodeURIComponent(
              iconsMap[alias]
            )}`}
          />
        </div>
      ),
    [alias]
  )

  const TagName = isButton ? 'button' : 'div'

  // if (isLink && href) {
  //   return (
  //     <Link
  //       href={href}
  //       className={clsx(styles.card, styles.link, isMobile && styles.mobile)}>
  //       {iconsMap[alias] && (
  //         <div className={styles.imageContainer}>
  //           <img
  //             src={`data:image/svg+xml;utf8,${encodeURIComponent(
  //               iconsMap[alias]
  //             )}`}
  //           />
  //         </div>
  //       )}
  //       {!hideText && (
  //         <div className={styles.textContainer}>
  //           <Typography.Title level={2}>{name}</Typography.Title>
  //           {!!description && size === 'default' && (
  //             <Typography>{description}</Typography>
  //           )}
  //         </div>
  //       )}
  //     </Link>
  //   )
  // }

  return (
    <TagName
      className={clsx(
        styles.card,
        styles[size],
        isMobile && styles.mobile,
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
