import React, {useEffect, useMemo} from 'react'

import type {Asana, Sequence as SequenceType} from 'types'

import type {GetServerSideProps} from 'next/types'
import type {PageProps} from 'types/page-props'

import {getSequence} from 'api'
import {Meta} from 'components/meta'
import {useRouter} from 'next/router'
import {useUser} from 'context/user'
import {Urls} from 'lib/urls'
import {useAsanas} from 'context/asanas'
import {SequenceViewer} from 'components/sequence-viewer'
import {Spinner} from 'components/spinner'

import styles from './styles.module.css'

const CreateSequencePage: React.FC<PageProps & {sequence: SequenceType}> = ({
  isMobile,
  sequence: {isPublic, blocks, title = ''}
}) => {
  const {asanasMap, isFetching: isAsanasFetching} = useAsanas()

  const data = useMemo(
    () =>
      blocks.reduce((acc: Record<string, Asana[]>, curValue, index) => {
        acc[index] = curValue.asanas.map(
          ({id, options: {inRepeatingBlock, inDynamicBlock}}) => ({
            ...asanasMap[id],
            isAsanaInRepeatingBlock: inRepeatingBlock,
            isAsanaInDynamicBlock: inDynamicBlock
          })
        )

        return acc
      }, {}),
    [asanasMap, blocks]
  )

  const router = useRouter()

  const {isAuthorized, isFetching} = useUser()

  useEffect(() => {
    if (!isPublic) {
      router.replace(Urls.PUBLIC_SEQUENCES)
    }
  }, [isPublic, router])

  useEffect(() => {
    if (!isFetching && !isAuthorized) {
      router.push(Urls.LOGIN)
    }
  }, [isAuthorized, isFetching, router])

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <div className={styles.root}>
        {isFetching || (!isFetching && !isAuthorized) || isAsanasFetching ? (
          <Spinner />
        ) : (
          <SequenceViewer isMobile={isMobile} data={data} title={title} />
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

  const sequence = await getSequence(context.query.id as string, {
    cookies: context.req.headers.cookie || ''
  })

  return {props: {isMobile, sequence}}
}

export default CreateSequencePage
