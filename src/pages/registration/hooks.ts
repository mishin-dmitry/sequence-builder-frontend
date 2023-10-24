import {useCallback} from 'react'
import {registerUser as registerUserAction, type RegisterUserRequest} from 'api'
import {type UseFormSetError} from 'react-hook-form'
import {type RegistrationFormInputs} from './registration-form'
import {notification} from 'antd'
import {useUser} from 'context/user'

interface UseRegister {
  registerUser: (
    data: RegisterUserRequest,
    setError: UseFormSetError<RegistrationFormInputs>
  ) => Promise<void>
}

export const useRegister = (): UseRegister => {
  const {updateUser} = useUser()

  const registerUser = useCallback(
    async (
      values: RegisterUserRequest,
      setError: UseFormSetError<RegistrationFormInputs>
    ) => {
      try {
        const user = await registerUserAction(values)

        updateUser(user)

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
    [updateUser]
  )

  return {
    registerUser
  }
}
