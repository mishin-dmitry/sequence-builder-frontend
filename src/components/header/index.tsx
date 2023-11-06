'use client'

import React from 'react'

import {Layout} from 'antd'
import {MobileMenu} from './mobile-menu'
import {DesktopMenu} from './desktop-menu'
import {ThemeSwitcher} from 'components/theme-switcher'
import {LoginLink} from 'components/login-link'

import styles from './styles.module.css'

interface HeaderProps {
  isAuthorized: boolean
  isMobile: boolean
}

export const Header: React.FC<HeaderProps> = ({isAuthorized, isMobile}) => {
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
