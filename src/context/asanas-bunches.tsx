'use client'

import {getUserAsanasBunches} from 'api'
import React, {
  useMemo,
  type PropsWithChildren,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react'

import {useUser} from './user'

import type {AsanaBunch} from 'types'

interface AsanasBunchesContext {
  asanasBunches: AsanaBunch[]
  isLoading: boolean
  updateAsanasBunches: () => Promise<void>
}

const initialData: AsanasBunchesContext = {
  asanasBunches: [],
  updateAsanasBunches: async () => undefined,
  isLoading: false
}

const AsanasBunchesContext = React.createContext(initialData)

export const ProvideAsanasBunches: React.FC<PropsWithChildren> = ({
  children
}) => {
  const [asanasBunches, setAsanasBunches] = useState<AsanaBunch[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {isAuthorized} = useUser()

  const updateAsanasBunches = useCallback(async () => {
    if (!isAuthorized) return

    try {
      setIsLoading(true)

      const response = await getUserAsanasBunches()

      setAsanasBunches(response)
    } catch (error) {
      setAsanasBunches([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthorized])

  useEffect(() => {
    if (!isAuthorized) return

    updateAsanasBunches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized])

  const value = useMemo<AsanasBunchesContext>(
    () => ({asanasBunches, updateAsanasBunches, isLoading}),
    [asanasBunches, updateAsanasBunches, isLoading]
  )

  return (
    <AsanasBunchesContext.Provider value={value}>
      {children}
    </AsanasBunchesContext.Provider>
  )
}

export const useAsanasBunches = (): AsanasBunchesContext =>
  useContext(AsanasBunchesContext)
