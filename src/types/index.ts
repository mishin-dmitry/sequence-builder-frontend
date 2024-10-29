export interface Asana {
  id: number
  name: string
  key?: string
  description: string
  alias: string
  alignment: string
  searchKeys: string
  // Признак того, что асана находится в блоке,
  // который надо сделать на обратную сторону
  inRepeatingBlock?: boolean
  // Признак того, что асана находится в блоке,
  // который надо сделать в динамике
  inDynamicBlock?: boolean
  groups: AsanaGroup[]
  pirs: number[]
}

export interface AsanaGroup {
  id: number
  name: string
  categoryId: number
}

export interface AsanaGroupCategory {
  id: number
  name: string
  groups: AsanaGroup[]
}

interface BaseSequence {
  id?: number
  title?: string
  description?: string
  isPublic?: boolean
}

export interface SequenceRequest extends BaseSequence {
  blocks: {
    asanaId: number
    inRepeatingBlock: boolean
    inDynamicBlock: boolean
  }[][]
}

export interface Sequence extends BaseSequence {
  userId: number
  isFound?: boolean
  blocks: Asana[][]
}

export interface User {
  id: number
  email: string
  isFound?: boolean
}

export interface AsanaBunch {
  id?: string
  title: string
  asanas: Asana[]
  isFound?: boolean
}
