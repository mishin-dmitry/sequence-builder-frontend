import React, {useCallback, useEffect} from 'react'

import {getPublicSequences} from 'api/'
import {Meta} from 'components/meta'
import {useUser} from 'context/user'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'
import {SequenceTable} from 'components/sequence-table'

import type {Sequence} from 'types'
import type {GetServerSideProps} from 'next'

import styles from './styles.module.css'
import {Spinner} from 'components/spinner'

interface PageProps {
  isMobile: boolean
  sequences: Sequence[]
}

const PublicSequencesPage: React.FC<PageProps> = ({
  sequences = []
  // isMobile
}) => {
  const {isAuthorized, isFetching} = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isFetching && !isAuthorized) {
      router.push(Urls.LOGIN)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized, isFetching])

  const onShow = useCallback(
    (id: number) => {
      router.push(`${Urls.VIEW_SEQUENCE}/${id}`)
    },
    [router]
  )

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <div className={styles.pageWrapper}>
        {isFetching || (!isFetching && !isAuthorized) ? (
          <Spinner />
        ) : (
          <SequenceTable items={sequences} onShow={onShow} source="public" />
        )}
      </div>
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

  const sequences = await getPublicSequences({
    cookies: context.req.headers.cookie || ''
  })

  return {props: {isMobile, sequences}}
}

export default PublicSequencesPage
