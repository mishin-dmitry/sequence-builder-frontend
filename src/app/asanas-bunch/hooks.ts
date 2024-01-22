import {useCallback, useState} from 'react'
import {notification} from 'antd'

import {
  createAsanasBunch as apiCreateAsanasBunch,
  updateAsanasBunch as apiUpdateAsanasBunch,
  deleteAsanasBunch as apiDeleteAsanasBunch,
  type AsanasBunchRequest
} from 'api'

import type {AsanaBunch} from 'types'

interface UseAsanaBunch {
  createAsanasBunch: (data: AsanaBunch) => Promise<AsanaBunch | void>
  deleteAsanasBunch: (id: string) => Promise<void>
  updateAsanasBunch: (
    id: string,
    data: AsanaBunch
  ) => Promise<AsanaBunch | void>

  isFetching: boolean
}

export const useAsanaBunch = (): UseAsanaBunch => {
  const [isFetching, setIsFetching] = useState(false)

  const createAsanasBunch = useCallback(async (data: AsanaBunch) => {
    setIsFetching(true)

    try {
      const requestData: AsanasBunchRequest = {
        ...data,
        asanas: data.asanas.map(({id}) => id)
      }

      const response = await apiCreateAsanasBunch(requestData)

      notification['success']({
        message: 'Связка асан успешно создана'
      })

      return response
    } catch (error) {
      notification['error']({
        message: 'При создании связки асан возникла ошибка'
      })
    } finally {
      setIsFetching(false)
    }
  }, [])

  const updateAsanasBunch = useCallback(
    async (id: string, data: AsanaBunch) => {
      setIsFetching(true)

      try {
        const requestData: AsanasBunchRequest = {
          ...data,
          asanas: data.asanas.map(({id}) => id)
        }

        const response = await apiUpdateAsanasBunch(id, requestData)

        notification['success']({
          message: 'Связка асан успешно отредактирована'
        })

        return response
      } catch (error) {
        notification['error']({
          message: 'При редактировании связки асан возникла ошибка'
        })
      } finally {
        setIsFetching(false)
      }
    },
    []
  )

  const deleteAsanasBunch = useCallback(async (id: string) => {
    setIsFetching(true)

    try {
      await apiDeleteAsanasBunch(id)

      notification['success']({
        message: 'Связка асан успешно удалена'
      })
    } catch (error) {
      notification['error']({
        message: 'При удалении связки асан возникла ошибка'
      })
    } finally {
      setIsFetching(false)
    }
  }, [])

  return {
    isFetching,
    createAsanasBunch,
    updateAsanasBunch,
    deleteAsanasBunch
  }
}
