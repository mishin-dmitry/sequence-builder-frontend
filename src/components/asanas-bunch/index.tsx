import React, {useCallback} from 'react'

import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'
import {Typography} from 'antd'

import type {Asana} from 'types'

import styles from './styles.module.css'

interface AsanaBunchProps {
  title: string
  asanas: Asana[]
  onClick: (asanas: Asana[]) => void
}

export const AsanaBunch: React.FC<AsanaBunchProps> = ({
  title,
  asanas,
  onClick: propOnClick
}) => {
  const {isDarkTheme} = useSettings()

  const renderImage = useCallback(
    ({alias}: Asana, index: number) => {
      return (
        iconsMap[alias] && (
          <div className={styles.imageContainer} key={index}>
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
        )
      )
    },
    [isDarkTheme]
  )

  const onClick = useCallback(() => {
    propOnClick(asanas)
  }, [asanas, propOnClick])

  return (
    <button className={styles.asanaBunch} onClick={onClick}>
      <div className={styles.asanas}>{asanas.map(renderImage)}</div>
      <Typography.Title level={5} className={styles.title}>
        {title}
      </Typography.Title>
    </button>
  )
}
