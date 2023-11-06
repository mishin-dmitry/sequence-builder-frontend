import {useCallback, useState} from 'react'
import type {Sequence, SequenceRequest} from 'types'

import {
  createSequence as createSequenceAction,
  deleteSequence as deleteSequenceAction,
  updateSequence as updateSequenceAction
} from 'api'

import {notification} from 'antd'

interface UseSequence {
  createSequence: (data: SequenceRequest) => Promise<Sequence | void>
  deleteSequence: (id: number) => Promise<void>
  updateSequence: (
    id: string,
    data: SequenceRequest
  ) => Promise<Sequence | void>
  isFetching: boolean
}

export const useSequence = (): UseSequence => {
  const [isFetching, setIsFetching] = useState(false)

  const createSequence = useCallback(async (data: SequenceRequest) => {
    setIsFetching(true)

    try {
      const response = await createSequenceAction(data)

      notification['success']({
        message: 'Последовательность создана'
      })

      return response
    } catch (error) {
      notification['error']({
        message: 'При создании последовательности возникла ошибка'
      })
    } finally {
      setIsFetching(false)
    }
  }, [])

  const updateSequence = useCallback(
    async (id: string, data: SequenceRequest) => {
      setIsFetching(true)

      try {
        const response = await updateSequenceAction(id, data)

        notification['success']({
          message: 'Последовательность отредактирована'
        })

        return response
      } catch (error) {
        notification['error']({
          message: 'При редактировании последовательности возникла ошибка'
        })
      } finally {
        setIsFetching(false)
      }
    },
    []
  )

  const deleteSequence = useCallback(async (id: number) => {
    setIsFetching(true)

    try {
      await deleteSequenceAction(id)

      notification['success']({
        message: 'Последовательность удалена'
      })
    } catch {
      notification['error']({
        message: 'При удалении последовательности возникла ошибка'
      })
    } finally {
      setIsFetching(false)
    }
  }, [])

  return {createSequence, deleteSequence, updateSequence, isFetching}
}
