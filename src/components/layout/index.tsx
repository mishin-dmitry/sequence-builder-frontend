import React from 'react'

import {Layout as AntdLayout} from 'antd'
import {MobileMenu} from 'components/mobile-menu'
import {ThemeSwitcher} from 'components/theme-switcher'

import styles from './styles.module.css'
import clsx from 'clsx'

export interface LayoutProps {
  children: React.ReactNode
  isMobile: boolean
}

export const Layout: React.FC<LayoutProps> = ({children, isMobile}) => (
  <AntdLayout className={clsx(styles.layout, isMobile && styles.mobile)}>
    <AntdLayout.Header className={styles.header}>
      {isMobile && <MobileMenu />}
      <ThemeSwitcher />
    </AntdLayout.Header>
    <main className={styles.main}>{children}</main>
  </AntdLayout>
)
