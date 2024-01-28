'use client'

import React, {useEffect} from 'react'

// import type {Sequence as SequenceType} from 'types'

import {useRouter} from 'next/navigation'
// import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
// import {SequenceViewer} from 'components/sequence-viewer'
import {Spinner} from 'components/spinner'

import styles from './styles.module.css'

// TODO archived

export const ViewSequence: React.FC = () => {
  const router = useRouter()

  // const {isAuthorized} = useUser()

  useEffect(() => {
    router.replace(Urls.CREATE_SEQUENCE)
  }, [router])

  // useEffect(() => {
  //   if (!isAuthorized) {
  //     router.push(Urls.LOGIN)
  //   }
  // }, [isAuthorized, router])

  return (
    <>
      <div className={styles.root}>
        <Spinner />
        {/* {!isAuthorized ? (
          <Spinner />
        ) : (
          <SequenceViewer data={blocks} title={title} />
        )} */}
      </div>
    </>
  )
}
