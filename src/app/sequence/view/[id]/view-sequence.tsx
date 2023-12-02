'use client'

import React, {useEffect, useMemo} from 'react'

import type {Asana, Sequence as SequenceType} from 'types'

import {useRouter} from 'next/navigation'
import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
import {useAsanas} from 'context/asanas'
import {SequenceViewer} from 'components/sequence-viewer'
import {Spinner} from 'components/spinner'

import styles from './styles.module.css'

export const ViewSequence: React.FC<{sequence: SequenceType}> = ({
  sequence: {isPublic, blocks, title = ''}
}) => {
  const {asanasMap} = useAsanas()

  const data = useMemo(
    () =>
      blocks.reduce((acc: Record<string, Asana[]>, curValue, index) => {
        acc[index] = curValue.map(({id, inRepeatingBlock, inDynamicBlock}) => ({
          ...asanasMap[id],
          isAsanaInRepeatingBlock: inRepeatingBlock,
          isAsanaInDynamicBlock: inDynamicBlock
        }))

        return acc
      }, {}),
    [asanasMap, blocks]
  )

  const router = useRouter()

  const {isAuthorized} = useUser()

  useEffect(() => {
    if (!isPublic) {
      router.replace(Urls.PUBLIC_SEQUENCES)
    }
  }, [isPublic, router])

  useEffect(() => {
    if (!isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, router])

  return (
    <>
      <div className={styles.root}>
        {!isAuthorized ? (
          <Spinner />
        ) : (
          <SequenceViewer data={data} title={title} />
        )}
      </div>
    </>
  )
}
