'use client'

import React, {useCallback, useEffect} from 'react'

import {
  RequestResetPasswordForm,
  type RequestResetPasswordFormInputs
} from './request-reset-password-form'

import {usePasswordRecovery} from './hooks'
import {useUser} from 'context/user'
import {Spinner} from 'components/spinner'
import {useRouter} from 'next/navigation'
import {Urls} from 'lib/urls'

const RequestResetPasswordPage: React.FC = () => {
  const {getRecoveryLink} = usePasswordRecovery()
  const {isAuthorized} = useUser()

  const router = useRouter()

  const onSubmit = useCallback(
    async (values: RequestResetPasswordFormInputs) => {
      await getRecoveryLink(values)
    },
    [getRecoveryLink]
  )

  useEffect(() => {
    if (isAuthorized) {
      router.push(Urls.CREATE_SEQUENCE)
    }
  }, [isAuthorized, router])

  return (
    <>
      {isAuthorized && <Spinner />}
      {!isAuthorized && <RequestResetPasswordForm onSubmit={onSubmit} />}
    </>
  )
}

export default RequestResetPasswordPage
