'use client'

import React, {useEffect} from 'react'

import {Meta} from 'components/meta'
import {useRouter} from 'next/navigation'
import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
import {MainPageEditor} from 'components/main-page-editor'
import type {Sequence} from 'types'

interface EditSequenceProps {
  sequence: Sequence
}

export const EditSequence: React.FC<EditSequenceProps> = ({sequence}) => {
  const router = useRouter()

  const {user, isAuthorized} = useUser()

  useEffect(() => {
    if (!!user && user.id !== sequence.userId) {
      router.replace(Urls.CREATE_SEQUENCE)
    }
  }, [router, user, sequence.userId])

  useEffect(() => {
    if (!isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, router])

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <MainPageEditor sequence={sequence} isEditMode />
    </>
  )
}
