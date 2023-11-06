import React, {useCallback, useEffect} from 'react'

import {Meta} from 'components/meta'

import {LoginForm, type LoginFormInputs} from './login-form'
import {useLogin} from './hooks'
import {useUser} from 'context/user'
import {Spinner} from 'components/spinner'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'

import {type UseFormSetError} from 'react-hook-form'
import {type GetServerSideProps} from 'next'

const LoginPage: React.FC = () => {
  const {login} = useLogin()
  const {isFetching, isAuthorized} = useUser()

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
      {!isAuthorized && !isFetching && <LoginForm onSubmit={onSubmit} />}
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

export default LoginPage
