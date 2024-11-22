import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges
} from '@dnd-kit/sortable'

export const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const {isSorting, wasDragging} = args

  if (isSorting || wasDragging) {
    return defaultAnimateLayoutChanges(args)
  }

  return true
}
