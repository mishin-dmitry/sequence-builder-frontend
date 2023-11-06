import React, {type PropsWithChildren} from 'react'

import {cookies, headers} from 'next/headers'
import {Layout} from 'antd'
import {type Metadata} from 'next'
import {getAsanaGroupsList, getAsanasList, getUser} from 'api'
import {Asana} from 'types'
import {Header} from 'components/header'
import {StyledComponentsRegistry} from 'lib/antd-registry'
import {ProvideUser} from 'context/user'
import {ProvideAsanas} from 'context/asanas'
import {ProvideSettings} from 'context/settings'

import styles from './styles.module.css'
import '../styles/global.css'
import '../styles/variables.css'

export const metadata: Metadata = {
  title: 'Построение последовательностей для йоги',
  description:
    'Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию.',
  keywords: 'Йога, построение последовательностей, асаны'
}

const RootLayout: React.FC<PropsWithChildren> = async ({children}) => {
  const [{isFound, ...user}, asanas, asanaGroups] = await Promise.all([
    getUser({cookies: cookies().toString()}),
    getAsanasList(),
    getAsanaGroupsList()
  ])

  asanas.sort((a, b) => (a.name > b.name ? 1 : -1))
  asanaGroups.sort((a, b) => (a.name > b.name ? 1 : -1))

  const asanasMap = asanas.reduce((acc: Record<string, Asana>, curValue) => {
    acc[curValue.id] = curValue

    return acc
  }, {})

  const UA = headers().get('user-agent')

  const isMobile = Boolean(
    UA?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  )

  const theme = (cookies().get('seq_theme')?.value || 'light') as
    | 'light'
    | 'dark'

  return (
    <html lang="ru" {...(theme === 'dark' && {'data-theme': 'dark'})}>
      <ProvideUser user={isFound ? user : null}>
        <ProvideAsanas
          asanas={asanas}
          asanaGroups={asanaGroups}
          asanasMap={asanasMap}>
          <ProvideSettings theme={theme} isMobile={isMobile}>
            <StyledComponentsRegistry>
              <body {...(isMobile ? {'data-mobile': true} : {})}>
                <Layout className={styles.layout}>
                  <Header />
                  <main className={styles.main}>{children}</main>
                </Layout>
              </body>
            </StyledComponentsRegistry>
          </ProvideSettings>
        </ProvideAsanas>
      </ProvideUser>
    </html>
  )
}

export default RootLayout
