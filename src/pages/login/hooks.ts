import {useCallback} from 'react'
import {login as loginAction, type RegisterUserRequest} from 'api'
import {type UseFormSetError} from 'react-hook-form'
import {type LoginFormInputs} from './login-form'
import {useUser} from 'context/user'

interface UseLogin {
  login: (
    data: RegisterUserRequest,
    setError: UseFormSetError<LoginFormInputs>
  ) => Promise<void>
}

export const useLogin = (): UseLogin => {
  const {updateUser} = useUser()

  const login = useCallback(
    async (
      values: RegisterUserRequest,
      setError: UseFormSetError<LoginFormInputs>
    ) => {
      try {
        const user = await loginAction(values)

        updateUser(user)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Invalid password or email') {
            setError('email', {
              message: 'Вы ввели неправильную почту или пароль'
            })
          }
        }
      }
    },
    [updateUser]
  )

  return {
    login
  }
}
