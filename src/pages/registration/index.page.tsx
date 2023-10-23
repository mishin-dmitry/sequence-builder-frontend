import React, {useCallback} from 'react'

import {Meta} from 'components/meta'

import {
  RegistrationForm,
  type RegistrationFormInputs
} from './registration-form'
import {useRegister} from './hooks'
import {type UseFormSetError} from 'react-hook-form'

const RegistrationPage: React.FC = () => {
  const {registerUser} = useRegister()

  const onSubmit = useCallback(
    async (
      values: RegistrationFormInputs,
      setError: UseFormSetError<RegistrationFormInputs>
    ) => {
      await registerUser(values, setError)
    },
    [registerUser]
  )

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <RegistrationForm onSubmit={onSubmit} />
    </>
  )
}

export default RegistrationPage
