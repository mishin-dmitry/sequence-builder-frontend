// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {HttpMethod, request} from './request'

export interface SendFeedbackRequest {
  name: string
  email: string
  topic: string
  text: string
}

export const sendFeedback = request.bind<
  null,
  string,
  [SendFeedbackRequest],
  Promise<void>
>(null, HttpMethod.POST, 'api/feedback')
