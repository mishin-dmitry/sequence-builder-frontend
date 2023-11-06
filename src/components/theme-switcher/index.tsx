import React from 'react'

import SunIcon from './sun.svg'
import MoonIcon from './moon.svg'

import {useSettings} from 'context/settings'

import styles from './styles.module.css'

export const ThemeSwitcher: React.FC = () => {
  const {toggleTheme} = useSettings()

  return (
    <div className={styles.switcher} onClick={toggleTheme}>
      <SunIcon className={styles.sunIcon} />
      <MoonIcon className={styles.moonIcon} />
    </div>
  )
}
