import {useCallback} from 'react'
import {sendFeedback as sendFeedbackAction, type SendFeedbackRequest} from 'api'
import {notification} from 'antd'

interface UseFeedback {
  sendFeedback: (data: SendFeedbackRequest) => Promise<void>
}

export const useFeedback = (): UseFeedback => {
  const sendFeedback = useCallback(async (values: SendFeedbackRequest) => {
    try {
      await sendFeedbackAction(values)

      notification['success']({
        message: 'Ваше сообщение успешно отправлено'
      })
    } catch (error) {
      notification['error']({
        message: 'При отправке сообщения произошла ошибка, попробуйте еще раз'
      })
    }
  }, [])

  return {
    sendFeedback
  }
}
