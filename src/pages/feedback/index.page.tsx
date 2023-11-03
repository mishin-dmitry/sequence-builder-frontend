import React, {useCallback} from 'react'

import {Meta} from 'components/meta'

import {FeedbackForm, type FeedbackFormInputs} from './feedback-form'
import {useFeedback} from './hooks'

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

export default FeedbackPage
