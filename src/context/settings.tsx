'use client'

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

interface UseSettings {
  toggleTheme: () => void
  isDarkTheme: boolean
  isMobile: boolean
}

const initialContext: UseSettings = {
  isDarkTheme: false,
  isMobile: false,
  toggleTheme: () => undefined
}

const SettingsContext = React.createContext<UseSettings>(initialContext)

interface ProvideSettingsProps extends PropsWithChildren {
  theme: 'light' | 'dark'
  isMobile: boolean
}

export const ProvideSettings: React.FC<ProvideSettingsProps> = ({
  children,
  theme: initialTheme,
  isMobile
}) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toggleTheme,
      isMobile
    }),
    [isMobile, theme, toggleTheme]
  )

  return (
    <SettingsContext.Provider value={value}>
      <ConfigProvider
        theme={{
          token: {
            motion: false
          },
          algorithm: theme === 'dark' ? darkAlgorithm : defaultAlgorithm
        }}>
        {children}
      </ConfigProvider>
    </SettingsContext.Provider>
  )
}

export const useSettings = (): UseSettings => React.useContext(SettingsContext)
