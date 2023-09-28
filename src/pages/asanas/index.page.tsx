import React, {useEffect} from 'react'

import {Spinner} from 'components/spinner'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'

const AsanaListPage: React.FC = () => {
  const router = useRouter()

  useEffect(() => {
    router.push(Urls.CREATE_SEQUENCE)
  }, [router])

  return <Spinner />
}

export default AsanaListPage
