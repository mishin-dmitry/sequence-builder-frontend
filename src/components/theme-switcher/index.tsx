import React from 'react'

import SunIcon from './sun.svg'
import MoonIcon from './moon.svg'
import {useTheme} from 'context/theme'

import styles from './styles.module.css'

export const ThemeSwitcher: React.FC = () => {
  const {toggleTheme} = useTheme()

  return (
    <div className={styles.switcher} onClick={toggleTheme}>
      <SunIcon className={styles.sunIcon} />
      <MoonIcon className={styles.moonIcon} />
    </div>
  )
}
