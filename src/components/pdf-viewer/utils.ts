import type {Asana} from 'types'

export enum BlockType {
  REPEATING = 'repeating',
  DYNAMIC = 'dynamic',
  BOTH = 'both'
}

export interface AsanaBlock {
  type: BlockType
  asanas: Asana[]
}

type AsanasSequence = (Asana | AsanaBlock)[]

export const isBlock = (
  target: Asana | AsanaBlock | null
): target is AsanaBlock => !!(target as AsanaBlock)?.type

export const prepareAsanasBlock = (asanas: Asana[]): AsanasSequence => {
  return asanas.reduce((acc: AsanasSequence, curValue) => {
    const lastElement = acc.length ? acc[acc.length - 1] : null

    const hasOnlyRepeatingBlock =
      curValue.inRepeatingBlock && !curValue.inDynamicBlock

    const hasOnlyDynamicBlock =
      curValue.inDynamicBlock && !curValue.inRepeatingBlock

    const hasOneBlock = curValue.inRepeatingBlock || curValue.inDynamicBlock

    if (hasOneBlock) {
      const type = hasOnlyRepeatingBlock
        ? BlockType.REPEATING
        : hasOnlyDynamicBlock
        ? BlockType.DYNAMIC
        : BlockType.BOTH

      if (isBlock(lastElement) && lastElement.type === type) {
        lastElement.asanas.push(curValue)
      } else {
        acc.push({type, asanas: [curValue]})
      }

      return acc
    }

    acc.push(curValue)

    return acc
  }, [])
}
