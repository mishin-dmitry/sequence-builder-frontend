import React from 'react'

import {iconsMap} from 'icons'

interface AsanaImageProps {
  alias: string
  isDarkTheme: boolean
  isLazy?: boolean
  width?: number
  height?: number
}

export const AsanaImage: React.FC<AsanaImageProps> = ({
  alias,
  isDarkTheme,
  isLazy,
  width,
  height
}) =>
  iconsMap[alias] && (
    <img
      width={width}
      height={height}
      loading={isLazy ? 'lazy' : undefined}
      src={`data:image/svg+xml;utf8,${encodeURIComponent(
        iconsMap[alias].replaceAll(
          '$COLOR',
          isDarkTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)'
        )
      )}`}
      alt="Изображение асаны"
    />
  )
