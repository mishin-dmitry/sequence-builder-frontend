import React, {useCallback} from 'react'

import {Meta} from 'components/meta'

import {FeedbackForm, type FeedbackFormInputs} from './feedback-form'
import {useFeedback} from './hooks'
import {type GetServerSideProps} from 'next'

const FeedbackPage: React.FC = () => {
  const {sendFeedback} = useFeedback()

  const onSubmit = useCallback(
    async (values: FeedbackFormInputs) => {
      await sendFeedback(values)
    },
    [sendFeedback]
  )

  return (
    <>
      <Meta
        title="Построение последовательностей для йоги"
        description="Создайте свой идеальный путь в йоге с нашим приложением для построения последовательностей. Планируйте, комбинируйте и улучшайте свою практику йоги с Sequoia – вашим верным спутником на пути к гармонии и благополучию."
        keywords="Йога, построение последовательностей, асаны"
      />
      <FeedbackForm onSubmit={onSubmit} />
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

  const theme = context.req.cookies.seq_theme || 'light'

  return {props: {isMobile, theme}}
}

export default FeedbackPage
