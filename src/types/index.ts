export interface Asana {
  id?: number
  name: string
  description: string
  image: string
}

export interface Sequence {
  title?: string
  asanas: Exclude<Asana, 'id'>[]
}
