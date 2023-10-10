import React, {useEffect} from 'react'

import type {AppProps} from 'next/app'

import {ErrorBoundary} from 'components/error-boundary'
import {Layout} from 'components/layout'
import {activateYandexMetrika} from 'lib/metrics'

import 'styles/global.css'

const App: React.FC<AppProps> = ({Component, pageProps = {}}) => {
  useEffect(() => {
    activateYandexMetrika()
  }, [])

  return (
    <>
      <ErrorBoundary fallback={<h1>Что то пошло не так...</h1>}>
        <Layout isMobile={pageProps.isMobile}>
          <Component {...pageProps} />
        </Layout>
      </ErrorBoundary>
    </>
  )
}

export default App
