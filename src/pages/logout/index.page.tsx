import React, {useEffect} from 'react'

import {Meta} from 'components/meta'
import {useUser} from 'context/user'

import {Spinner} from 'components/spinner'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'
import {useLogout} from './hooks'

const LogoutPage: React.FC = () => {
  const {isFetching, isAuthorized} = useUser()
  const {logout} = useLogout()

  const router = useRouter()

  useEffect(() => {
    const logoutUser = async (): Promise<void> => {
      await logout()

      router.push(Urls.LOGIN)
    }

    if (!isFetching && isAuthorized) {
      logoutUser()
    } else {
      router.replace(Urls.CREATE_SEQUENCE)
    }
  }, [isAuthorized, isFetching, logout, router])

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <Spinner />
    </>
  )
}

export default LogoutPage
