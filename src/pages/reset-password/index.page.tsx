import React, {useCallback, useEffect} from 'react'

import {Meta} from 'components/meta'

import {
  UpdatePasswordForm,
  type UpdatePasswordFormInputs
} from './update-password-form'
import {useUpdatePassword} from './hooks'
import {useUser} from 'context/user'
import {Spinner} from 'components/spinner'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'
import {type GetServerSideProps} from 'next'

const ResetPasswordPage: React.FC = () => {
  const {updatePassword} = useUpdatePassword()
  const {isFetching, isAuthorized} = useUser()

  const router = useRouter()

  const onSubmit = useCallback(
    async (values: UpdatePasswordFormInputs) => {
      await updatePassword({
        ...values,
        token: router.query.token as string,
        id: router.query.id as string
      })
    },
    [router.query.id, router.query.token, updatePassword]
  )

  useEffect(() => {
    if (router.isReady && (!router.query.token || !router.query.id)) {
      router.push(Urls.LOGIN, undefined, {shallow: true})
    }
  }, [router])

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
      {isFetching && <Spinner />}
      {!isAuthorized && !isFetching && (
        <UpdatePasswordForm onSubmit={onSubmit} />
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

export default ResetPasswordPage
