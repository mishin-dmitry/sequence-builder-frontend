import React, {useCallback} from 'react'

import {Meta} from 'components/meta'

import {LoginForm, type LoginFormInputs} from './login-form'
import {useLogin} from './hooks'
import {type UseFormSetError} from 'react-hook-form'

const LoginPage: React.FC = () => {
  const {login} = useLogin()

  const onSubmit = useCallback(
    async (
      values: LoginFormInputs,
      setError: UseFormSetError<LoginFormInputs>
    ) => {
      await login(values, setError)
    },
    [login]
  )

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <LoginForm onSubmit={onSubmit} />
    </>
  )
}

export default LoginPage
