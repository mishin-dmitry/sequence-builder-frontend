import React, {useEffect} from 'react'

import {Layout as AntdLayout} from 'antd'
import {MobileMenu} from 'components/mobile-menu'
import {ThemeSwitcher} from 'components/theme-switcher'

import styles from './styles.module.css'

export interface LayoutProps {
  children: React.ReactNode
  isMobile: boolean
}

export const Layout: React.FC<LayoutProps> = ({children, isMobile}) => {
  useEffect(() => {
    if (isMobile) {
      document.body.setAttribute('data-mobile', 'true')
    } else {
      document.body.removeAttribute('data-mobile')
    }
  }, [isMobile])

  return (
    <AntdLayout className={styles.layout}>
      <AntdLayout.Header className={styles.header}>
        {isMobile && <MobileMenu />}
        <ThemeSwitcher />
      </AntdLayout.Header>
      <main className={styles.main}>{children}</main>
    </AntdLayout>
  )
}
