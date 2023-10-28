import React, {
  useState,
  type PropsWithChildren,
  useMemo,
  useContext,
  useCallback,
  useEffect
} from 'react'

import {getUser} from 'api'

import {type User} from 'types/user'

interface UserContext {
  isFetching: boolean
  user: User | null
  isAuthorized: boolean
  updateUser: (user: User | null) => void
}

const initialData: UserContext = {
  isFetching: false,
  user: null,
  isAuthorized: false,
  updateUser: () => undefined
}

const UserContext = React.createContext(initialData)

export const ProvideUser: React.FC<PropsWithChildren> = ({children}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isFetching, setIsFetching] = useState(true)

  const updateUser = useCallback(setUser, [setUser])

  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      setIsFetching(true)

      try {
        const {isFound, ...user} = await getUser()

        setUser(isFound ? user : null)
      } catch (error) {
        console.error(error)
      } finally {
        setIsFetching(false)
      }
    }

    loadUser()
  }, [])

  const value = useMemo<UserContext>(
    () => ({user, isFetching, isAuthorized: !!user, updateUser}),
    [isFetching, user, updateUser]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = (): UserContext => useContext(UserContext)
