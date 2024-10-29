'use client'

import React, {useMemo, useContext} from 'react'

import type {Asana, AsanaGroupCategory} from 'types'

interface AsanasContext {
  asanas: Asana[]
  asanaGroupsCategories: AsanaGroupCategory[]
  asanasMap: Record<string, Asana>
  pirPairs: [number, number][]
}

const initialData: AsanasContext = {
  asanas: [],
  asanaGroupsCategories: [],
  asanasMap: {},
  pirPairs: []
}

const AsanasContext = React.createContext(initialData)

export const ProvideAsanas: React.FC<
  AsanasContext & {children: React.ReactNode}
> = ({children, asanas, asanaGroupsCategories, asanasMap, pirPairs}) => {
  const value = useMemo<AsanasContext>(
    () => ({asanas, asanaGroupsCategories, asanasMap, pirPairs}),
    [asanaGroupsCategories, asanas, asanasMap, pirPairs]
  )

  return (
    <AsanasContext.Provider value={value}>{children}</AsanasContext.Provider>
  )
}

export const useAsanas = (): AsanasContext => useContext(AsanasContext)
