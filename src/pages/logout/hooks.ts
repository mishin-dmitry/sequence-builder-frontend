import {useCallback} from 'react'
import {logout as logoutAction} from 'api'
import {useUser} from 'context/user'

interface UseLogout {
  logout: () => Promise<void>
}

export const useLogout = (): UseLogout => {
  const {updateUser} = useUser()

  const logout = useCallback(async () => {
    await logoutAction()

    updateUser(null)
  }, [updateUser])

  return {
    logout
  }
}
