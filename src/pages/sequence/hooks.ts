import {useCallback} from 'react'
import {type Sequence} from 'types'
import {createSequence as createSequenceAction} from 'api'

interface UseSequence {
  createSequence: (data: Sequence) => Promise<void>
}

export const useSequence = (): UseSequence => {
  const createSequence = useCallback(async (data: Sequence) => {
    try {
      await createSequenceAction(data)
    } catch (error) {
      console.error(error)
    }
  }, [])

  return {createSequence}
}
