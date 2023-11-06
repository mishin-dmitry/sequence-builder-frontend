'use client'

import React from 'react'

import {Layout} from 'antd'
import {MobileMenu} from './mobile-menu'
import {DesktopMenu} from './desktop-menu'
import {ThemeSwitcher} from 'components/theme-switcher'
import {LoginLink} from 'components/login-link'
import {useUser} from 'context/user'
import {useSettings} from 'context/settings'

import styles from './styles.module.css'

export const Header: React.FC = () => {
  const {isAuthorized} = useUser()
  const {isMobile} = useSettings()

  return (
    <Layout.Header className={styles.header}>
      {isMobile ? (
        <MobileMenu isAuthorized={isAuthorized} />
      ) : (
        <DesktopMenu isAuthorized={isAuthorized} />
      )}
      <div className={styles.leftRow}>
        <ThemeSwitcher />
        <LoginLink isAuthorized={isAuthorized} />
      </div>
    </Layout.Header>
  )
}
