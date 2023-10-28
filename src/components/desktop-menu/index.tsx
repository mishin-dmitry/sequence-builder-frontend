import React, {useMemo} from 'react'

import {Menu, Row} from 'antd'
import {Urls} from 'lib/urls'
import {useRouter} from 'next/router'
import {NAV_MENU_LINKS} from 'lib/nav-menu-links'

import styles from './styles.module.css'
import Link from 'next/link'
import dynamic from 'next/dynamic'

interface DesktopMenuProps {
  isAuthorized: boolean
}

const DesktopMenu: React.FC<DesktopMenuProps> = ({isAuthorized}) => {
  const router = useRouter()

  const links = useMemo(
    () =>
      NAV_MENU_LINKS.filter(({forAuthorized}) =>
        forAuthorized ? isAuthorized : true
      ).map(({title, href}) => ({
        key: href,
        label: (
          <Link href={href} as={href}>
            {title}
          </Link>
        )
      })),
    [isAuthorized]
  )

  return (
    <div className={styles.menuWrapper}>
      <Row justify="space-between" className={styles.row}>
        <Menu
          theme="dark"
          mode="horizontal"
          items={links}
          selectedKeys={[router.pathname]}
          className={styles.menu}
        />
        {isAuthorized ? (
          <Link href={Urls.LOGOUT} as={Urls.LOGOUT} className={styles.link}>
            Выйти
          </Link>
        ) : (
          <Link href={Urls.LOGIN} as={Urls.LOGIN} className={styles.link}>
            Войти
          </Link>
        )}
      </Row>
    </div>
  )
}

export default dynamic(() => Promise.resolve(DesktopMenu), {
  ssr: false
})
