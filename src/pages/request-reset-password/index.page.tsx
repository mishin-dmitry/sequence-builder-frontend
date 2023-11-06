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
import {type GetServerSideProps} from 'next'

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
      router.push(Urls.CREATE_SEQUENCE, undefined, {shallow: true})
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const UA = context.req.headers['user-agent']

  const isMobile = Boolean(
    UA?.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  )

  const theme = context.req.cookies.seq_theme || 'light'

  return {props: {isMobile, theme}}
}

export default RequestResetPasswordPage
