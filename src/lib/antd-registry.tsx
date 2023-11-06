'use client'

import React, {type PropsWithChildren} from 'react'
import {useServerInsertedHTML} from 'next/navigation'
import {StyleProvider, createCache, extractStyle} from '@ant-design/cssinjs'

export const StyledComponentsRegistry: React.FC<PropsWithChildren> = ({
  children
}) => {
  const [cache] = React.useState(() => createCache())

  useServerInsertedHTML(() => (
    <style
      id="antd"
      dangerouslySetInnerHTML={{__html: extractStyle(cache, true)}}></style>
  ))

  return <StyleProvider cache={cache}>{children}</StyleProvider>
}
