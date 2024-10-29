import React, {type PropsWithChildren} from 'react'

import {cookies as nextCookies, headers} from 'next/headers'
import {Layout} from 'antd'
import {type Metadata} from 'next'
import {getAsanaGroupsCategoriesList, getAsanasList, getUser} from 'api'
import {Asana} from 'types'
import {Header} from 'components/header'
import {StyledComponentsRegistry} from 'lib/antd-registry'
import {ProvideUser} from 'context/user'
import {ProvideAsanas} from 'context/asanas'
import {ProvideSettings} from 'context/settings'
import {ProvideAsanasBunches} from 'context/asanas-bunches'

import Favicon from '/public/static/favicon.ico'

import styles from './styles.module.css'
import '../styles/global.css'
import '../styles/variables.css'

export const metadata: Metadata = {
  title: 'Построение последовательностей для йоги',
  description:
    'Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию.',
  keywords: 'Йога, построение последовательностей, асаны',
  icons: [{rel: 'icon', url: Favicon.src}]
}

const RootLayout: React.FC<PropsWithChildren> = async ({children}) => {
  const cookies = nextCookies().toString()

  const [{isFound, ...user}, asanas, asanaGroupsCategories] = await Promise.all(
    [getUser({cookies}), getAsanasList(), getAsanaGroupsCategoriesList()]
  )

  asanas.sort((a, b) => (a.name > b.name ? 1 : -1))

  const asanasMap = asanas.reduce((acc: Record<string, Asana>, curValue) => {
    acc[curValue.id] = curValue

    return acc
  }, {})

  const pirPairs = asanas.reduce((acc: [number, number][], curValue: Asana) => {
    if (curValue.pirs.length) {
      curValue.pirs.forEach((pirId) => {
        acc.push([curValue.id, pirId])
      })
    }

    return acc
  }, [])

  const UA = headers().get('user-agent')

  const isMobile = Boolean(
    UA?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  )

  const theme = (nextCookies().get('seq_theme')?.value || 'light') as
    | 'light'
    | 'dark'

  return (
    <html lang="ru" {...(theme === 'dark' && {'data-theme': 'dark'})}>
      <ProvideUser user={isFound ? user : null}>
        <ProvideAsanas
          asanas={asanas}
          asanaGroupsCategories={asanaGroupsCategories}
          pirPairs={pirPairs}
          asanasMap={asanasMap}>
          <ProvideAsanasBunches>
            <ProvideSettings theme={theme} isMobile={isMobile}>
              <StyledComponentsRegistry>
                <body {...(isMobile ? {'data-mobile': true} : {})}>
                  <Layout className={styles.layout}>
                    <Header />
                    <main className={styles.main}>
                      <h1 className={styles.visuallyHidden}>
                        Построение последовательностей для йога
                      </h1>
                      {children}
                    </main>
                  </Layout>
                </body>
              </StyledComponentsRegistry>
            </ProvideSettings>
          </ProvideAsanasBunches>
        </ProvideAsanas>
      </ProvideUser>
    </html>
  )
}

export default RootLayout
