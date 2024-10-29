'use client'

import React, {useEffect} from 'react'
import {useUser} from 'context/user'
import {useRouter} from 'next/navigation'
import {Urls} from 'lib/urls'
import {MainPageEditor} from 'components/main-page-editor'

const CreateAsanasBunchPage: React.FC = () => {
  const {isAuthorized} = useUser()

  const router = useRouter()

  useEffect(() => {
    if (!isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, router])

  return <MainPageEditor isBunchMode />
}

export default CreateAsanasBunchPage
