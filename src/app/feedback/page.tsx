'use client'

import React, {useCallback} from 'react'

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

  return <FeedbackForm onSubmit={onSubmit} />
}

export default FeedbackPage
