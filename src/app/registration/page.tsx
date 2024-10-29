'use client'

import React, {useEffect} from 'react'

import {
  RegistrationForm,
  type RegistrationFormInputs
} from './registration-form'

import {type UseFormSetError} from 'react-hook-form'

import {useRegister} from './hooks'
import {useUser} from 'context/user'
import {useRouter} from 'next/navigation'
import {Urls} from 'lib/urls'
import {Spinner} from 'components/spinner'

const RegistrationPage: React.FC = () => {
  const {registerUser} = useRegister()
  const {isAuthorized} = useUser()

  const router = useRouter()

  const onSubmit = async (
    values: RegistrationFormInputs,
    setError: UseFormSetError<RegistrationFormInputs>
  ): Promise<void> => {
    await registerUser(values, setError)
  }

  useEffect(() => {
    if (isAuthorized) {
      router.push(Urls.CREATE_SEQUENCE)
    }
  }, [isAuthorized, router])

  if (isAuthorized) return <Spinner />

  return <RegistrationForm onSubmit={onSubmit} />
}

export default RegistrationPage
