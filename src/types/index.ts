export interface Asana {
  id?: number
  name: string
  description: string
  alias: string
  searchKeys: string
}

export interface Sequence {
  title?: string
  asanas: Exclude<Asana, 'id'>[]
}
