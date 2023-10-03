import React from 'react'

import {Layout as AntdLayout} from 'antd'
import {MobileMenu} from 'components/mobile-menu'

import styles from './styles.module.css'
import clsx from 'clsx'

export interface LayoutProps {
  children: React.ReactNode
  isMobile: boolean
}

export const Layout: React.FC<LayoutProps> = ({children, isMobile}) => (
  <AntdLayout className={styles.layout}>
    <AntdLayout.Header className={styles.header}>
      {isMobile && <MobileMenu />}
    </AntdLayout.Header>
    <main className={clsx(styles.main, isMobile && styles.mobile)}>
      {children}
    </main>
  </AntdLayout>
)
