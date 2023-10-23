import {useCallback} from 'react'
import {login as loginAction, type RegisterUserRequest} from 'api'
import {type UseFormSetError} from 'react-hook-form'
import {type LoginFormInputs} from './login-form'
import {notification} from 'antd'

interface UseLogin {
  login: (
    data: RegisterUserRequest,
    setError: UseFormSetError<LoginFormInputs>
  ) => void
}

export const useLogin = (): UseLogin => {
  const login = useCallback(
    async (
      values: RegisterUserRequest,
      setError: UseFormSetError<LoginFormInputs>
    ) => {
      try {
        await loginAction(values)

        notification['success']({
          message: 'Пользователь успешно аутентифицирован'
        })
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
    []
  )

  return {
    login
  }
}
