'use client'

import React from 'react'

import {FeedbackForm, type FeedbackFormInputs} from './feedback-form'
import {useFeedback} from './hooks'

const FeedbackPage: React.FC = () => {
  const {sendFeedback} = useFeedback()

  const onSubmit = async (values: FeedbackFormInputs): Promise<void> => {
    await sendFeedback(values)
  }

  return <FeedbackForm onSubmit={onSubmit} />
}

export default FeedbackPage
