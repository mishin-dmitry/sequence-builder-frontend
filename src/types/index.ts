export interface Asana {
  id?: number
  name: string
  description: string
  alias: string
  searchKeys: string
  groups: AsanaGroup[]
}

export interface AsanaGroup {
  id: number
  name: string
}

export interface Sequence {
  title?: string
  asanas: Exclude<Asana, 'id'>[]
}
