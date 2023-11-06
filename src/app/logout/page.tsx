'use client'

import React, {useEffect} from 'react'

import {useUser} from 'context/user'

import {Spinner} from 'components/spinner'
import {useRouter} from 'next/navigation'
import {Urls} from 'lib/urls'
import {useLogout} from './hooks'

const LogoutPage: React.FC = () => {
  const {isAuthorized} = useUser()
  const {logout} = useLogout()

  const router = useRouter()

  useEffect(() => {
    const logoutUser = async (): Promise<void> => {
      await logout()

      router.push(Urls.LOGIN)
    }

    if (isAuthorized) {
      logoutUser()
    } else {
      router.replace(Urls.CREATE_SEQUENCE)
    }
  }, [isAuthorized, logout, router])

  return <Spinner />
}

export default LogoutPage
