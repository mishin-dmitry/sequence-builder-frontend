import React, {useCallback, useEffect} from 'react'

import {Meta} from 'components/meta'

import {
  RegistrationForm,
  type RegistrationFormInputs
} from './registration-form'
import {useRegister} from './hooks'
import {type UseFormSetError} from 'react-hook-form'
import {useUser} from 'context/user'
import {Spinner} from 'components/spinner'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'

const RegistrationPage: React.FC = () => {
  const {registerUser} = useRegister()
  const {isFetching, isAuthorized} = useUser()

  const router = useRouter()

  const onSubmit = useCallback(
    async (
      values: RegistrationFormInputs,
      setError: UseFormSetError<RegistrationFormInputs>
    ) => {
      await registerUser(values, setError)
    },
    [registerUser]
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
      {isFetching && <Spinner />}
      {!isAuthorized && !isFetching && <RegistrationForm onSubmit={onSubmit} />}
    </>
  )
}

export default RegistrationPage