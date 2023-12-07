'use client'

import React, {useCallback, useEffect} from 'react'

import {useUser} from 'context/user'
import {useRouter} from 'next/navigation'
import {Urls} from 'lib/urls'
import {SequenceTable} from 'components/sequence-table'

import type {Sequence} from 'types'

import styles from './styles.module.css'

interface PublicSequenceProps {
  sequences: Sequence[]
}

export const PublicSequences: React.FC<PublicSequenceProps> = ({
  sequences = []
}) => {
  const {isAuthorized} = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthorized) {
      router.push(Urls.LOGIN)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized])

  const onShow = useCallback(
    (id: number) => {
      router.push(`${Urls.VIEW_SEQUENCE}/${id}`)
    },
    [router]
  )

  return (
    <div className={styles.pageWrapper}>
      <SequenceTable items={sequences} onShow={onShow} source="public" />
    </div>
  )
}
