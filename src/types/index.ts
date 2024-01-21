export interface Asana {
  id: number
  name: string
  description: string
  alias: string
  alignment: string
  searchKeys: string
  // Признак того, что асана находится в блоке,
  // который надо сделать на обратную сторону
  isAsanaInRepeatingBlock?: boolean
  // Признак того, что асана находится в блоке,
  // который надо сделать в динамике
  isAsanaInDynamicBlock?: boolean
  groups: AsanaGroup[]
  pirs: {pirId: number; title: string}[]
}

export interface AsanaGroup {
  id: number
  name: string
}

interface BaseSequence {
  id?: number
  title?: string
  description?: string
  isPublic?: boolean
}

export interface SequenceRequest extends BaseSequence {
  blocks: {asanaId: number; inRepeatingBlock: boolean}[][]
}

export interface Sequence extends BaseSequence {
  userId: number
  isFound?: boolean
  blocks: {
    id: number
    alias: string
    inRepeatingBlock: boolean
    inDynamicBlock: boolean
  }[][]
}
