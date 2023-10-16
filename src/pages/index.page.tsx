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
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <Spinner />
    </>
  )
}

export default RootPage
