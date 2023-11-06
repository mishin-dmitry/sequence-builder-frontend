import React, {useEffect} from 'react'

import {Layout as AntdLayout} from 'antd'
import {useUser} from 'context/user'
import {ThemeSwitcher} from 'components/theme-switcher'
import {LoginLink} from 'components/login-link'

import MobileMenu from 'components/mobile-menu'
import DesktopMenu from 'components/desktop-menu'

import styles from './styles.module.css'

export interface LayoutProps {
  children: React.ReactNode
  isMobile: boolean
}

export const Layout: React.FC<LayoutProps> = ({children, isMobile}) => {
  const {isAuthorized} = useUser()

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
        {isMobile ? (
          <MobileMenu isAuthorized={isAuthorized} />
        ) : (
          <DesktopMenu isAuthorized={isAuthorized} />
        )}
        <div className={styles.leftRow}>
          <ThemeSwitcher />
          <LoginLink isAuthorized={isAuthorized} />
        </div>
      </AntdLayout.Header>

      <main className={styles.main}>{children}</main>
    </AntdLayout>
  )
}
