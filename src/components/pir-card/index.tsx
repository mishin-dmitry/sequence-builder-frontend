import React, {useMemo} from 'react'

import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'

import {type Asana} from 'types'

import styles from './styles.module.css'

interface PirCardProps {
  source: Asana
  pir: Asana
  onClick: (pir: [number, number]) => void
}

export const PirCard: React.FC<PirCardProps> = ({source, pir, onClick}) => {
  const {isDarkTheme} = useSettings()

  const sourceAsanaImage = useMemo(() => {
    const {alias} = source

    return (
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
      )
    )
  }, [isDarkTheme, source])

  const pirAsanaImage = useMemo(() => {
    const {alias} = pir

    return (
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
      )
    )
  }, [isDarkTheme, pir])

  return (
    <div
      className={styles.pirCard}
      onClick={() => onClick([source.id, pir.id])}>
      <div className={styles.images}>
        {sourceAsanaImage}
        {pirAsanaImage}
      </div>
    </div>
  )
}
