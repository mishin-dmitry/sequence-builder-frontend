import React from 'react'

import {Layout as AntdLayout} from 'antd'
import MobileMenu from 'components/mobile-menu'
import DesktopMenu from 'components/desktop-menu'

import styles from './styles.module.css'
import clsx from 'clsx'
import {useUser} from 'context/user'

export interface LayoutProps {
  children: React.ReactNode
  isMobile: boolean
}

export const Layout: React.FC<LayoutProps> = ({children, isMobile}) => {
  const {isAuthorized} = useUser()

  return (
    <AntdLayout className={styles.layout}>
      <AntdLayout.Header className={styles.header}>
        {isMobile ? (
          <MobileMenu isAuthorized={isAuthorized} />
        ) : (
          <DesktopMenu isAuthorized={isAuthorized} />
        )}
      </AntdLayout.Header>
      <main className={clsx(styles.main, isMobile && styles.mobile)}>
        {children}
      </main>
    </AntdLayout>
  )
}
