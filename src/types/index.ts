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
  blocks: {
    id: number
    asanas: {
      id: number
      alias: string
      options: {
        inRepeatingBlock: boolean
      }
    }[]
  }[]
}
