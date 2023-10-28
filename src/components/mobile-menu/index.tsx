import React, {useCallback, useMemo, useState} from 'react'

import {Drawer, Menu, Row} from 'antd'
import {LoginOutlined, LogoutOutlined, MenuOutlined} from '@ant-design/icons'
import {NAV_MENU_LINKS} from 'lib/nav-menu-links'
import {Urls} from 'lib/urls'
import {useRouter} from 'next/router'

import styles from './styles.module.css'
import Link from 'next/link'
import clsx from 'clsx'
import dynamic from 'next/dynamic'

interface MobileMenuProps {
  isAuthorized: boolean
}

const MobileMenu: React.FC<MobileMenuProps> = ({isAuthorized}) => {
  const [isOpen, setIsOpen] = useState(false)

  const router = useRouter()

  const closeMenu = useCallback(() => setIsOpen(false), [])
  const openMenu = useCallback(() => setIsOpen(true), [])

  const links = useMemo(
    () =>
      NAV_MENU_LINKS.filter(({forAuthorized}) =>
        forAuthorized ? isAuthorized : true
      ).map(({title, href}) => (
        <Menu.Item onClick={closeMenu} key={href}>
          <Link href={href} as={href}>
            {title}
          </Link>
        </Menu.Item>
      )),
    [closeMenu, isAuthorized]
  )

  return (
    <div className={styles.menuWrapper}>
      <Row justify="space-between" className={styles.row}>
        <button
          className={clsx(styles.burgerMenu, styles.link)}
          onClick={openMenu}>
          <MenuOutlined />
        </button>
        {isAuthorized ? (
          <Link href={Urls.LOGOUT} className={styles.link}>
            <LogoutOutlined />
          </Link>
        ) : (
          <Link href={Urls.LOGIN} className={styles.link}>
            <LoginOutlined />
          </Link>
        )}
      </Row>
      <Drawer
        open={isOpen}
        onClose={closeMenu}
        bodyStyle={{padding: '20px 0'}}
        placement="left">
        <Menu
          mode="inline"
          rootClassName={styles.menu}
          selectable
          selectedKeys={[router.pathname]}>
          {links}
        </Menu>
      </Drawer>
    </div>
  )
}

export default dynamic(() => Promise.resolve(MobileMenu), {
  ssr: false
})
