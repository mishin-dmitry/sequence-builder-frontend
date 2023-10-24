import React, {useEffect} from 'react'

import type {AppProps} from 'next/app'

import {ErrorBoundary} from 'components/error-boundary'
import {Layout} from 'components/layout'
import {activateYandexMetrika} from 'lib/metrics'
import {usePageLoading} from 'lib/use-page-loading'
import {ProvideUser} from 'context/user'
import {Spinner} from 'components/spinner'

import 'styles/global.css'

const App: React.FC<AppProps> = ({Component, pageProps = {}}) => {
  const {isPageLoading} = usePageLoading()

  useEffect(() => {
    activateYandexMetrika()
  }, [])

  return (
    <>
      <ErrorBoundary fallback={<h1>Что то пошло не так...</h1>}>
        <ProvideUser>
          <Layout isMobile={pageProps.isMobile}>
            {isPageLoading ? <Spinner /> : <Component {...pageProps} />}
          </Layout>
        </ProvideUser>
      </ErrorBoundary>
    </>
  )
}

export default App
