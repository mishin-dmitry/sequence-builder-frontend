export interface Asana {
  id: number
  name: string
  description: string
  alias: string
  searchKeys: string
  // Признак того, что асана находится в блоке,
  // который надо сделать на обратную сторону
  isAsanaInRepeatingBlock?: boolean
  groups: AsanaGroup[]
}

export interface AsanaGroup {
  id: number
  name: string
}

export interface Sequence {
  title?: string
  description?: string
  isPublic?: boolean
  blocks: {asanaId: number; inRepeatingBlock: boolean}[][]
}
