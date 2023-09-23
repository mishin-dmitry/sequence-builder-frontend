import {getAsanasList} from 'api/actions'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {Asana} from 'types'

export interface AsanasProviderData {
  asanas: Asana[]
  isFetching: boolean
  getAsanaById: (id: number) => Asana | undefined
  fetchAsanaList?: () => Promise<void>
}

const initialContext: AsanasProviderData = {
  asanas: [],
  isFetching: false,
  getAsanaById: () => undefined
}

const AsanasContext = createContext<AsanasProviderData>(initialContext)

export const ProvideAsanas: React.FC<{children: React.ReactNode}> = ({
  children
}) => {
  const [asanas, setAsanas] = useState<Asana[]>([])
  const [isFetching, setIsFetching] = useState(false)

  const fetchAsanaList = useCallback(async () => {
    try {
      setIsFetching(true)

      const response = await getAsanasList()

      setAsanas(response)
    } catch (error) {
      console.error(error)
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchAsanaList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getAsanaById = useCallback(
    (id: number) => (asanas ?? []).find((asana) => asana.pk === id),
    [asanas]
  )

  const asanasData = useMemo(
    () => ({
      isFetching,
      asanas,
      getAsanaById,
      fetchAsanaList
    }),
    [isFetching, asanas, getAsanaById, fetchAsanaList]
  )

  return (
    <AsanasContext.Provider value={asanasData}>
      {children}
    </AsanasContext.Provider>
  )
}

export const useAsana = (): AsanasProviderData => useContext(AsanasContext)
