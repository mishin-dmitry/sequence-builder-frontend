import React, {useCallback, useMemo, useState} from 'react'

import {Drawer, Menu} from 'antd'
import {MenuOutlined} from '@ant-design/icons'
import {NAV_MENU_LINKS} from 'lib/nav-menu-links'
import {usePathname} from 'next/navigation'

import styles from './styles.module.css'
import Link from 'next/link'
import clsx from 'clsx'

interface MobileMenuProps {
  isAuthorized: boolean
}

export const MobileMenu: React.FC<MobileMenuProps> = ({isAuthorized}) => {
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  const closeMenu = useCallback(() => setIsOpen(false), [])
  const openMenu = useCallback(() => setIsOpen(true), [])

  const links = useMemo(
    () =>
      NAV_MENU_LINKS.filter(({forAuthorized}) =>
        forAuthorized ? isAuthorized : true
      ).map(({title, href}) => (
        <Menu.Item onClick={closeMenu} key={href}>
          <Link href={href} as={href} shallow>
            {title}
          </Link>
        </Menu.Item>
      )),
    [closeMenu, isAuthorized]
  )

  const style = useMemo(
    () => ({
      body: {padding: '20px 0'}
    }),
    []
  )

  const selectedKeys = useMemo(() => [pathname], [pathname])

  return (
    <div className={styles.menuWrapper}>
      <button
        className={clsx(styles.burgerMenu, styles.link)}
        onClick={openMenu}>
        <MenuOutlined />
      </button>
      <Drawer open={isOpen} onClose={closeMenu} styles={style} placement="left">
        <Menu
          mode="inline"
          rootClassName={styles.menu}
          selectable
          selectedKeys={selectedKeys}>
          {links}
        </Menu>
      </Drawer>
    </div>
  )
}
