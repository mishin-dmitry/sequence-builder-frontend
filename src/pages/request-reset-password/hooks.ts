import {useCallback} from 'react'
import {notification} from 'antd'
import {getRecoveryLink as getRecoveryLinkAction} from 'api'

interface UsePasswordRecovery {
  getRecoveryLink: (values: {email: string}) => Promise<void>
}

export const usePasswordRecovery = (): UsePasswordRecovery => {
  const getRecoveryLink = useCallback(async (values: {email: string}) => {
    try {
      await getRecoveryLinkAction(values)

      notification['success']({
        message: `Письмо для восстановления пароля было отправлено на почту ${values.email}`
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'user not found') {
          notification['error']({
            message: `Пользователь с почтовым ящиков ${values.email} не найден`
          })
        } else {
          notification['error']({
            message: 'При отправке письма произошла ошибка, попробуйте попозже'
          })
        }
      }
    }
  }, [])

  return {
    getRecoveryLink
  }
}
