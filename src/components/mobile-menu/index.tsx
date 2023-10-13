import React, {useCallback, useMemo, useState} from 'react'

import {Drawer, Menu} from 'antd'
import {MenuOutlined} from '@ant-design/icons'
import {NAV_MENU_LINKS} from 'lib/nav-menu-links'

import styles from './styles.module.css'
import Link from 'next/link'

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = useCallback(() => setIsOpen(false), [])
  const openMenu = useCallback(() => setIsOpen(true), [])

  const links = useMemo(
    () =>
      NAV_MENU_LINKS.map(({title, href}, index) => (
        <Menu.Item onClick={closeMenu} key={index}>
          <Link href={href} as={href}>
            {title}
          </Link>
        </Menu.Item>
      )),
    [closeMenu]
  )

  return (
    <div className={styles.menuWrapper}>
      <button className={styles.burgerMenu} onClick={openMenu}>
        <MenuOutlined />
      </button>
      <Drawer
        open={isOpen}
        onClose={closeMenu}
        bodyStyle={{padding: '20px 0'}}
        placement="left">
        <Menu mode="inline" rootClassName={styles.menu}>
          {links}
        </Menu>
      </Drawer>
    </div>
  )
}
