import React, {useCallback, useEffect} from 'react'

import {Meta} from 'components/meta'

import {
  RequestResetPasswordForm,
  type RequestResetPasswordFormInputs
} from './request-reset-password-form'

import {usePasswordRecovery} from './hooks'
import {useUser} from 'context/user'
import {Spinner} from 'components/spinner'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'

const RequestResetPasswordPage: React.FC = () => {
  const {getRecoveryLink} = usePasswordRecovery()
  const {isFetching, isAuthorized} = useUser()

  const router = useRouter()

  const onSubmit = useCallback(
    async (values: RequestResetPasswordFormInputs) => {
      await getRecoveryLink(values)
    },
    [getRecoveryLink]
  )

  useEffect(() => {
    if (!isFetching && isAuthorized) {
      router.push(Urls.CREATE_SEQUENCE)
    }
  }, [isAuthorized, isFetching, router])

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      {(isFetching || (!isFetching && isAuthorized)) && <Spinner />}
      {!isAuthorized && !isFetching && (
        <RequestResetPasswordForm onSubmit={onSubmit} />
      )}
    </>
  )
}

export default RequestResetPasswordPage
