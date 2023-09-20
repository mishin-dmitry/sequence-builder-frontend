import React from 'react'

import type {AppProps} from 'next/app'

import {ErrorBoundary} from 'components/error-boundary'

import 'styles/global.css'

const App: React.FC<AppProps> = ({Component, pageProps}) => {
  return (
    <>
      <ErrorBoundary fallback={<h1>Что то пошло не так...</h1>}>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  )
}

export default App
