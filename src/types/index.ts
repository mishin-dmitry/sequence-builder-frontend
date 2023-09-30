export interface Asana {
  id?: number
  name: string
  description: string
  alias: string
}

export interface Sequence {
  title?: string
  asanas: Exclude<Asana, 'id'>[]
}
