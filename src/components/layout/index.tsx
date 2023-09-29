import React from 'react'

import {Layout as AntdLayout} from 'antd'

import styles from './styles.module.css'
import clsx from 'clsx'
import {isMobile} from 'lib/is-mobile'

export interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({children}) => (
  <AntdLayout className={styles.layout}>
    <AntdLayout.Header />
    <main className={clsx(styles.main, isMobile() && styles.mobile)}>
      {children}
    </main>
  </AntdLayout>
)
