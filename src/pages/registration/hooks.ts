import {useCallback} from 'react'
import {registerUser as registerUserAction, type RegisterUserRequest} from 'api'
import {type UseFormSetError} from 'react-hook-form'
import {type RegistrationFormInputs} from './registration-form'
import {notification} from 'antd'

interface UseRegister {
  registerUser: (
    data: RegisterUserRequest,
    setError: UseFormSetError<RegistrationFormInputs>
  ) => void
}

export const useRegister = (): UseRegister => {
  const registerUser = useCallback(
    async (
      values: RegisterUserRequest,
      setError: UseFormSetError<RegistrationFormInputs>
    ) => {
      try {
        await registerUserAction(values)

        notification['success']({
          message: 'Пользователь успешно зарегистрирован'
        })
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'User already exists') {
            setError('email', {
              message: 'Пользователь с такой почтой уже существует'
            })
          }
        }
      }
    },
    []
  )

  return {
    registerUser
  }
}
