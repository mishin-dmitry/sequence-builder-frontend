import React, {useCallback} from 'react'

import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'
import {Typography} from 'antd'

import type {Asana} from 'types'

import styles from './styles.module.css'
import {AsanaImage} from 'components/asana-image'

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
            <AsanaImage isLazy isDarkTheme={isDarkTheme} alias={alias} />
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
