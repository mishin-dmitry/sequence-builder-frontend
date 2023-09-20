import React from 'react'

import type {ReactElement} from 'react'

import {Html, Main, NextScript} from 'next/document'

export default function Document(): ReactElement {
  return (
    <Html lang="ru">
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
