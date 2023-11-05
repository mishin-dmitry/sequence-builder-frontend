import React, {
  useState,
  type PropsWithChildren,
  useMemo,
  useCallback,
  useEffect
} from 'react'

import {ConfigProvider, theme} from 'antd'
import {getItem, setItem} from 'lib/local-storage'
import {LOCAL_STORAGE_THEME_PREFERENCE} from 'lib/constants'

interface UseTheme {
  toggleTheme: () => void
  isDarkTheme: boolean
}

const initialContext: UseTheme = {
  isDarkTheme: false,
  toggleTheme: () => undefined
}

const ThemeContext = React.createContext<UseTheme>(initialContext)

export const ProvideTheme: React.FC<PropsWithChildren> = ({children}) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  const {defaultAlgorithm, darkAlgorithm} = theme

  useEffect(() => {
    const themeFromLS = getItem(LOCAL_STORAGE_THEME_PREFERENCE)

    if (themeFromLS) {
      if (themeFromLS === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      }

      setIsDarkTheme(themeFromLS === 'dark')
    } else {
      const isDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      if (isDarkTheme) {
        document.documentElement.setAttribute('data-theme', 'dark')
      }

      setIsDarkTheme(isDarkTheme)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prevState) => {
      const isDark = !prevState

      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
      }

      setItem(LOCAL_STORAGE_THEME_PREFERENCE, isDark ? 'dark' : 'light')

      return isDark
    })
  }, [])

  const value = useMemo(
    () => ({
      isDarkTheme,
      toggleTheme
    }),
    [isDarkTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{algorithm: isDarkTheme ? darkAlgorithm : defaultAlgorithm}}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = (): UseTheme => React.useContext(ThemeContext)
