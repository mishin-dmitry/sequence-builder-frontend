'use client'

import React, {
  useState,
  type PropsWithChildren,
  useMemo,
  useContext,
  useCallback
} from 'react'

import {type User} from 'types'

interface UserContext {
  user: User | null
  isAuthorized: boolean
  updateUser: (user: User | null) => void
}

const initialData: UserContext = {
  user: null,
  isAuthorized: false,
  updateUser: () => undefined
}

const UserContext = React.createContext(initialData)

interface ProvideUserProps extends PropsWithChildren {
  user: User | null
}

export const ProvideUser: React.FC<ProvideUserProps> = ({
  children,
  user: initialUser
}) => {
  const [user, setUser] = useState<User | null>(initialUser)

  const updateUser = useCallback(setUser, [setUser])

  const value = useMemo<UserContext>(
    () => ({user, isAuthorized: !!user, updateUser}),
    [user, updateUser]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserContext => useContext(UserContext)
