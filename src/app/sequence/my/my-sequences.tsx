'use client'

import React, {useCallback, useEffect, useState} from 'react'

import {getUserSequences} from 'api/'
import {useUser} from 'context/user'
import {useRouter} from 'next/navigation'
import {Urls} from 'lib/urls'
import {SequenceTable} from 'components/sequence-table'
import {useSequence} from '../hooks'
import {Spinner} from 'components/spinner'

import type {Sequence} from 'types'

import styles from './styles.module.css'

interface PageProps {
  sequences: Sequence[]
}

export const MySequences: React.FC<PageProps> = ({sequences}) => {
  const [userSequences, setUserSequences] = useState(sequences)

  const router = useRouter()

  const {isAuthorized} = useUser()
  const {deleteSequence} = useSequence()

  useEffect(() => {
    if (!isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, router])

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
      router.push(`${Urls.EDIT_SEQUENCE}/${id}`)
    },
    [router]
  )

  return (
    <div className={styles.pageWrapper}>
      {!isAuthorized ? (
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
  )
}
