'use client'

import React, {useEffect} from 'react'

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

  const onSubmit = async (
    values: RequestResetPasswordFormInputs
  ): Promise<void> => {
    await getRecoveryLink(values)
  }

  useEffect(() => {
    if (isAuthorized) {
      router.push(Urls.CREATE_SEQUENCE)
    }
  }, [isAuthorized, router])

  return isAuthorized ? (
    <Spinner />
  ) : (
    <RequestResetPasswordForm onSubmit={onSubmit} />
  )
}

export default RequestResetPasswordPage
