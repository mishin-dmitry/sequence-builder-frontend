import React from 'react'

import Link from 'next/link'

import {Urls} from 'lib/urls'
import {LoginOutlined, LogoutOutlined} from '@ant-design/icons'

import styles from './styles.module.css'

export const LoginLink: React.FC<{isAuthorized: boolean}> = ({isAuthorized}) =>
  isAuthorized ? (
    <Link href={Urls.LOGOUT} as={Urls.LOGOUT} className={styles.link} shallow>
      <span>Выйти</span>
      <LogoutOutlined />
    </Link>
  ) : (
    <Link href={Urls.LOGIN} as={Urls.LOGIN} className={styles.link} shallow>
      <span>Войти</span>
      <LoginOutlined />
    </Link>
  )
