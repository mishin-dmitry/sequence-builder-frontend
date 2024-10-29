import React, {useMemo} from 'react'

import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'

import {type Asana} from 'types'

import styles from './styles.module.css'
import {AsanaImage} from 'components/asana-image'

interface PirCardProps {
  source: Asana
  pir: Asana
  onClick: (pir: Asana[]) => void
}

export const PirCard: React.FC<PirCardProps> = ({source, pir, onClick}) => {
  const {isDarkTheme} = useSettings()

  console.log('pir', pir)

  const sourceAsanaImage = useMemo(() => {
    const {alias} = source

    return (
      iconsMap[alias] && (
        <div className={styles.imageContainer}>
          <AsanaImage isLazy isDarkTheme={isDarkTheme} alias={alias} />
        </div>
      )
    )
  }, [isDarkTheme, source])

  const pirAsanaImage = useMemo(() => {
    const {alias} = pir

    return (
      iconsMap[alias] && (
        <div className={styles.imageContainer}>
          <AsanaImage isLazy isDarkTheme={isDarkTheme} alias={alias} />
        </div>
      )
    )
  }, [isDarkTheme, pir])

  return (
    <div className={styles.pirCard} onClick={() => onClick([source, pir])}>
      <div className={styles.images}>
        {sourceAsanaImage}
        {pirAsanaImage}
      </div>
    </div>
  )
}
