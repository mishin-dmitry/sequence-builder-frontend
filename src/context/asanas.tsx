'use client'

import React, {useMemo, type PropsWithChildren, useContext} from 'react'

import type {Asana, AsanaGroup} from 'types'

interface AsanasContext {
  asanas: Asana[]
  asanaGroups: AsanaGroup[]
  asanasMap: Record<string, Asana>
}

const initialData: AsanasContext = {
  asanas: [],
  asanaGroups: [],
  asanasMap: {}
}

const AsanasContext = React.createContext(initialData)

interface ProvideAsanasProps extends PropsWithChildren {
  asanas: Asana[]
  asanaGroups: AsanaGroup[]
  asanasMap: Record<string, Asana>
}

export const ProvideAsanas: React.FC<ProvideAsanasProps> = ({
  children,
  asanas,
  asanaGroups,
  asanasMap
}) => {
  const value = useMemo<AsanasContext>(
    () => ({asanas, asanaGroups, asanasMap}),
    [asanaGroups, asanas, asanasMap]
  )

  return (
    <AsanasContext.Provider value={value}>{children}</AsanasContext.Provider>
  )
}

export const useAsanas = (): AsanasContext => useContext(AsanasContext)
