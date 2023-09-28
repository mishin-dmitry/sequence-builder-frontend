import React from 'react'

import type {AppProps} from 'next/app'

import {ErrorBoundary} from 'components/error-boundary'
import {Layout} from 'components/layout'
import {ProvideAsanas} from 'context/asanas'

import 'styles/global.css'

const App: React.FC<AppProps> = ({Component, pageProps}) => (
  <>
    <ErrorBoundary fallback={<h1>Что то пошло не так...</h1>}>
      <ProvideAsanas>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ProvideAsanas>
    </ErrorBoundary>
  </>
)

export default App
