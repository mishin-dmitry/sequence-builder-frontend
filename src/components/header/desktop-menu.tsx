import React, {useMemo} from 'react'

import {Menu} from 'antd'
import {usePathname} from 'next/navigation'
import {NAV_MENU_LINKS} from 'lib/nav-menu-links'

import Link from 'next/link'

interface DesktopMenuProps {
  isAuthorized: boolean
}

export const DesktopMenu: React.FC<DesktopMenuProps> = ({isAuthorized}) => {
  const pathname = usePathname()

  const links = useMemo(
    () =>
      NAV_MENU_LINKS.filter(({forAuthorized}) =>
        forAuthorized ? isAuthorized : true
      ).map(({title, href}) => ({
        key: href,
        label: (
          <Link href={href} as={href} shallow>
            {title}
          </Link>
        )
      })),
    [isAuthorized]
  )

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      items={links}
      selectedKeys={[pathname]}
      style={{flex: 'auto', minWidth: 0}}
    />
  )
}
