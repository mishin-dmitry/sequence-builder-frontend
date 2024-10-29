import React from 'react'

import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'
import {Typography} from 'antd'
import {AsanaImage} from 'components/asana-image'

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
  onClick
}) => {
  const {isDarkTheme} = useSettings()

  const renderImage = ({alias}: Asana, index: number): React.ReactNode =>
    iconsMap[alias] && (
      <div className={styles.imageContainer} key={index}>
        <AsanaImage isLazy isDarkTheme={isDarkTheme} alias={alias} />
      </div>
    )

  return (
    <button className={styles.asanaBunch} onClick={() => onClick(asanas)}>
      <div className={styles.asanas}>{asanas.map(renderImage)}</div>
      <Typography.Title level={5} className={styles.title}>
        {title}
      </Typography.Title>
    </button>
  )
}
