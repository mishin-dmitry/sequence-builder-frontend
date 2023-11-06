import {useCallback} from 'react'
import {notification} from 'antd'

import {
  updatePassword as updatePasswordAction,
  type UpdatePasswordRequest
} from 'api'

import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'

interface UseUpdatePassword {
  updatePassword: (values: UpdatePasswordRequest) => Promise<void>
}

export const useUpdatePassword = (): UseUpdatePassword => {
  const router = useRouter()

  const updatePassword = useCallback(
    async (values: UpdatePasswordRequest) => {
      try {
        await updatePasswordAction(values)

        notification['success']({
          message: `Пароль успешно восстановлен`
        })

        await new Promise((resolve) => window.setTimeout(resolve, 2000))

        router.push(Urls.LOGIN, undefined, {shallow: true})
      } catch (error) {
        if (error instanceof Error) {
          notification['error']({
            message:
              'При восстановлении пароля произошла ошибка, попробуйте попозже'
          })
        }
      }
    },
    [router]
  )

  return {
    updatePassword
  }
}
