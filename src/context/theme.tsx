import React, {
  useState,
  type PropsWithChildren,
  useMemo,
  useCallback,
  useEffect
} from 'react'

import {ConfigProvider, theme as antdTheme} from 'antd'
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

export const ProvideTheme: React.FC<
  PropsWithChildren & {initialTheme: 'dark' | 'light'}
> = ({children, initialTheme}) => {
  const [theme, setTheme] = useState(initialTheme)

  const {defaultAlgorithm, darkAlgorithm} = antdTheme

  useEffect(() => {
    const themeFromLS = getItem<'dark' | 'light'>(
      LOCAL_STORAGE_THEME_PREFERENCE
    )

    if (themeFromLS) {
      setTheme(themeFromLS)
    } else {
      const isDarkTheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches

      setTheme(isDarkTheme ? 'dark' : 'light')
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prevState) => {
      const isDark = prevState === 'light'

      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')
        document.cookie = 'seq_theme=dark'
      } else {
        document.documentElement.removeAttribute('data-theme')
        document.cookie = 'seq_theme=light'
      }

      setItem(LOCAL_STORAGE_THEME_PREFERENCE, isDark ? 'dark' : 'light')

      return isDark ? 'dark' : 'light'
    })
  }, [])

  const value = useMemo(
    () => ({
      isDarkTheme: theme === 'dark',
      toggleTheme
    }),
    [theme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          token: {
            motion: false
          },
          algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm
        }}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = (): UseTheme => React.useContext(ThemeContext)
