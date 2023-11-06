import React, {useCallback, useEffect, useState} from 'react'

import {getUserSequences} from 'api/'
import {Meta} from 'components/meta'
import {useUser} from 'context/user'
import {useRouter} from 'next/router'
import {Urls} from 'lib/urls'
import {SequenceTable} from 'components/sequence-table'
import {useSequence} from '../hooks'

import type {Sequence} from 'types'
import type {GetServerSideProps} from 'next'

import styles from './styles.module.css'
import {Spinner} from 'components/spinner'

interface PageProps {
  isMobile: boolean
  sequences: Sequence[]
}

const MySequencesPage: React.FC<PageProps> = ({
  sequences = [] /*, isMobile*/
}) => {
  const [userSequences, setUserSequences] = useState(sequences)

  const router = useRouter()

  const {isAuthorized, isFetching} = useUser()
  const {deleteSequence} = useSequence()

  useEffect(() => {
    if (!isFetching && !isAuthorized) {
      router.push(Urls.LOGIN, undefined, {shallow: true})
    }
  }, [isAuthorized, isFetching, router])

  const onDelete = useCallback(
    async (id: number) => {
      await deleteSequence(id)

      const updatedSequences = await getUserSequences()

      setUserSequences(updatedSequences)
    },
    [deleteSequence]
  )

  const onEdit = useCallback(
    (id: number) => {
      router.push(`${Urls.EDIT_SEQUENCE}/${id}`, undefined, {shallow: true})
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
          <SequenceTable
            source="my"
            items={userSequences}
            onDelete={onDelete}
            onEdit={onEdit}
          />
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

  const sequences = await getUserSequences({
    cookies: context.req.headers.cookie || ''
  })

  return {props: {isMobile, sequences}}
}

export default MySequencesPage
