import React from 'react'

import {Layout as AntdLayout} from 'antd'

import styles from './styles.module.css'

export interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({children}) => (
  <AntdLayout className={styles.layout}>
    <AntdLayout.Header />
    <main className={styles.main}>{children}</main>
    <AntdLayout.Footer className={styles.footer}>
      Асаны предоставлены школой йоги{' '}
      <a
        href="https://chaturanga.yoga/"
        target="_blank"
        rel="noopener noreferrer">
        Чатуранга
      </a>
    </AntdLayout.Footer>
  </AntdLayout>
)
