import React from 'react'

import {SortableItem} from 'components/sortable-item'
import {iconsMap} from 'icons'
import {useSettings} from 'context/settings'

import type {Asana as TAsana} from 'types'

import clsx from 'clsx'
import styles from './styles.module.css'

interface AsanaProps {
  id: string
  index: number
  asana: TAsana
  className?: string
  blockId: string
  copyAsana: () => void
  onDeleteAsana: (id: number) => void
  addAsanaToBlock: (
    id: number,
    block: 'repeating' | 'dynamic',
    action: 'add' | 'delete'
  ) => void
  scrollToAsana: (id: number) => void
}

export const Asana: React.FC<AsanaProps> = ({
  id,
  index,
  asana,
  className,
  blockId,
  copyAsana,
  onDeleteAsana,
  scrollToAsana,
  addAsanaToBlock
}) => {
  const {alias} = asana
  const {isDarkTheme} = useSettings()

  return (
    <SortableItem
      id={id}
      blockId={blockId}
      index={index}
      onDelete={onDeleteAsana}
      asana={asana}
      addAsanasToBlock={addAsanaToBlock}
      copyAsana={copyAsana}
      scrollToAsana={scrollToAsana}
      className={clsx(styles.sortableWrapper, className)}>
      <div
        className={clsx(
          styles.imageWrapper,
          (alias === 'empty' || alias === 'separator') && styles.empty
        )}>
        {iconsMap[alias] && (
          <img
            width={70}
            height={70}
            src={`data:image/svg+xml;utf8,${encodeURIComponent(
              iconsMap[alias].replaceAll(
                '$COLOR',
                isDarkTheme
                  ? 'rgba(255, 255, 255, 0.85)'
                  : 'rgba(0, 0, 0, 0.88)'
              )
            )}`}
            alt="Изображение асаны"
          />
        )}
        {alias === 'empty' && <span>Пустое место</span>}
        {alias === 'separator' && <span>Разделитель</span>}
      </div>
    </SortableItem>
  )
}
