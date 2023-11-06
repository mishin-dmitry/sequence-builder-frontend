'use client'

import React, {useCallback, useEffect} from 'react'

import {LoginForm, type LoginFormInputs} from './login-form'
import {useLogin} from './hooks'
import {useUser} from 'context/user'
import {Spinner} from 'components/spinner'
import {useRouter} from 'next/navigation'
import {Urls} from 'lib/urls'

import {type UseFormSetError} from 'react-hook-form'

const LoginPage: React.FC = () => {
  const {login} = useLogin()
  const {isAuthorized} = useUser()

  const router = useRouter()

  const onSubmit = useCallback(
    async (
      values: LoginFormInputs,
      setError: UseFormSetError<LoginFormInputs>
    ) => {
      await login(values, setError)
    },
    [login]
  )

  useEffect(() => {
    if (isAuthorized) {
      router.push(Urls.CREATE_SEQUENCE)
    }
  }, [isAuthorized, router])

  if (isAuthorized) return <Spinner />

  return <LoginForm onSubmit={onSubmit} />
}

export default LoginPage
