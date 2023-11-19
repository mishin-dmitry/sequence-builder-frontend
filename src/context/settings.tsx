'use client'

import React, {
  useState,
  type PropsWithChildren,
  useMemo,
  useCallback
} from 'react'

import {ConfigProvider, theme as antdTheme} from 'antd'

import {useCookies} from 'react-cookie'

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
  const [_, setCookie] = useCookies(['seq_theme'])

  const toggleTheme = useCallback(() => {
    setTheme((prevState) => {
      const isDark = prevState === 'light'

      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark')

        setCookie('seq_theme', 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')

        setCookie('seq_theme', 'light')
      }

      return isDark ? 'dark' : 'light'
    })
  }, [setCookie])

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
