'use client'

import React, {useEffect} from 'react'

import {
  UpdatePasswordForm,
  type UpdatePasswordFormInputs
} from './update-password-form'
import {useUpdatePassword} from './hooks'
import {useUser} from 'context/user'
import {Spinner} from 'components/spinner'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'

const ResetPasswordPage: React.FC = () => {
  const {updatePassword} = useUpdatePassword()
  const {isAuthorized} = useUser()

  const router = useRouter()

  const onSubmit = async (values: UpdatePasswordFormInputs): Promise<void> => {
    await updatePassword({
      ...values,
      token: router.query.token as string,
      id: router.query.id as string
    })
  }

  useEffect(() => {
    if (router.isReady && (!router.query.token || !router.query.id)) {
      router.push(Urls.LOGIN)
    }
  }, [router])

  useEffect(() => {
    if (isAuthorized) {
      router.push(Urls.CREATE_SEQUENCE)
    }
  }, [isAuthorized, router])

  return isAuthorized ? <Spinner /> : <UpdatePasswordForm onSubmit={onSubmit} />
}

export default ResetPasswordPage
