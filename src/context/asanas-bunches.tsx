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
  updateAsanasBunches: () => Promise<void>
}

const initialData: AsanasBunchesContext = {
  asanasBunches: [],
  updateAsanasBunches: async () => undefined
}

const AsanasBunchesContext = React.createContext(initialData)

export const ProvideAsanasBunches: React.FC<PropsWithChildren> = ({
  children
}) => {
  const [asanasBunches, setAsanasBunches] = useState<AsanaBunch[]>([])

  const {isAuthorized} = useUser()

  const updateAsanasBunches = useCallback(async () => {
    if (!isAuthorized) return

    try {
      const response = await getUserAsanasBunches()

      setAsanasBunches(response)
    } catch (error) {
      setAsanasBunches([])
    }
  }, [isAuthorized])

  useEffect(() => {
    if (!isAuthorized) return

    updateAsanasBunches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized])

  const value = useMemo<AsanasBunchesContext>(
    () => ({asanasBunches, updateAsanasBunches}),
    [asanasBunches, updateAsanasBunches]
  )

  return (
    <AsanasBunchesContext.Provider value={value}>
      {children}
    </AsanasBunchesContext.Provider>
  )
}

export const useAsanasBunches = (): AsanasBunchesContext =>
  useContext(AsanasBunchesContext)
