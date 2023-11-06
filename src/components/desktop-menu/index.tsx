import React, {useMemo} from 'react'

import {Menu} from 'antd'
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
      <Menu
        theme="dark"
        mode="horizontal"
        items={links}
        selectedKeys={[router.pathname]}
        style={{flex: 'auto', minWidth: 0}}
      />
    </div>
  )
}

export default dynamic(() => Promise.resolve(DesktopMenu), {
  ssr: false
})
