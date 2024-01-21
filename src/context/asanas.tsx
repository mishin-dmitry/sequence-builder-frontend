'use client'

import React, {useMemo, type PropsWithChildren, useContext} from 'react'

import type {Asana, AsanaGroup} from 'types'

interface AsanasContext {
  asanas: Asana[]
  asanaGroups: AsanaGroup[]
  asanasMap: Record<string, Asana>
  pirPairs: [number, number][]
}

const initialData: AsanasContext = {
  asanas: [],
  asanaGroups: [],
  asanasMap: {},
  pirPairs: []
}

const AsanasContext = React.createContext(initialData)

interface ProvideAsanasProps extends PropsWithChildren {
  asanas: Asana[]
  asanaGroups: AsanaGroup[]
  asanasMap: Record<string, Asana>
  pirPairs: [number, number][]
}

export const ProvideAsanas: React.FC<ProvideAsanasProps> = ({
  children,
  asanas,
  asanaGroups,
  asanasMap,
  pirPairs
}) => {
  const value = useMemo<AsanasContext>(
    () => ({asanas, asanaGroups, asanasMap, pirPairs}),
    [asanaGroups, asanas, asanasMap, pirPairs]
  )

  return (
    <AsanasContext.Provider value={value}>{children}</AsanasContext.Provider>
  )
}

export const useAsanas = (): AsanasContext => useContext(AsanasContext)
