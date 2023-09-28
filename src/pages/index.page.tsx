import React, {useEffect} from 'react'

import {Meta} from 'components/meta'
import {Spinner} from 'components/spinner'
import {Urls} from 'lib/urls'
import {useRouter} from 'next/router'

const RootPage: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    router.push(Urls.CREATE_SEQUENCE)
  }, [router])

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Постройте последовательность занятий по йоге"
      />
      <Spinner />
    </>
  )
}

export default RootPage
