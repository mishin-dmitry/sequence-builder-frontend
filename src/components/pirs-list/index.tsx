import React from 'react'

import {PirCard} from 'components/pir-card'
import {useAsanas} from 'context/asanas'

import type {Asana} from 'types'
import styles from './styles.module.css'

interface PirsListProps {
  pairs: [number, number][]
  onClick: (pir: Asana[]) => void
}

export const PirsList: React.FC<PirsListProps> = ({pairs, onClick}) => {
  const {asanasMap} = useAsanas()

  if (!pairs.length) {
    return <div className={styles.list}>Список пуст...</div>
  }

  return (
    <div className={styles.listWrapper}>
      <div className={styles.list}>
        {pairs.map(([sourceId, pirId], index) => (
          <PirCard
            key={index}
            source={asanasMap[sourceId]}
            pir={asanasMap[pirId]}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  )
}
