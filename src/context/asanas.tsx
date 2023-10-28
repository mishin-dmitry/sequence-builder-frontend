import React, {
  useMemo,
  type PropsWithChildren,
  useContext,
  useState,
  useEffect
} from 'react'

import {getAsanaGroupsList, getAsanasList} from 'api'

import type {Asana, AsanaGroup} from 'types'

interface AsanasContext {
  asanas: Asana[]
  asanaGroups: AsanaGroup[]
  asanasMap: Record<string, Asana>
  isFetching: boolean
}

const initialData: AsanasContext = {
  asanas: [],
  asanaGroups: [],
  asanasMap: {},
  isFetching: true
}

const AsanasContext = React.createContext(initialData)

export const ProvideAsanas: React.FC<PropsWithChildren> = ({children}) => {
  const [asanas, setAsanas] = useState<Asana[]>([])
  const [asanaGroups, setAsanaGroups] = useState<AsanaGroup[]>([])
  const [asanasMap, setAsanasMap] = useState({})
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setIsFetching(true)

      try {
        const asanas = await getAsanasList()
        const asanaGroups = await getAsanaGroupsList()

        asanas.sort((a, b) => (a.name > b.name ? 1 : -1))
        asanaGroups.sort((a, b) => (a.name > b.name ? 1 : -1))

        const asanasMap = asanas.reduce(
          (acc: Record<string, Asana>, curValue) => {
            acc[curValue.id] = curValue

            return acc
          },
          {}
        )

        setAsanas(asanas)
        setAsanaGroups(asanaGroups)
        setAsanasMap(asanasMap)
      } catch {
      } finally {
        setIsFetching(false)
      }
    }

    loadData()
  }, [])

  const value = useMemo<AsanasContext>(
    () => ({asanas, asanaGroups, asanasMap, isFetching}),
    [asanaGroups, asanas, asanasMap, isFetching]
  )

  return (
    <AsanasContext.Provider value={value}>{children}</AsanasContext.Provider>
  )
}

export const useAsanas = (): AsanasContext => useContext(AsanasContext)
