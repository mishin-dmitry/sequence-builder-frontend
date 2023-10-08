// https://github.com/clauderic/dnd-kit/issues/477
import type {MouseEvent, KeyboardEvent, PointerEvent} from 'react'

import {
  MouseSensor as LibMouseSensor,
  KeyboardSensor as LibKeyboardSensor,
  PointerSensor as LibPointerSensor
} from '@dnd-kit/core'

export class MouseSensor extends LibMouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: ({nativeEvent: event}: MouseEvent) => {
        return shouldHandleEvent(event.target as HTMLElement)
      }
    }
  ]
}

export class KeyboardSensor extends LibKeyboardSensor {
  static activators = [
    {
      eventName: 'onKeyDown' as const,
      handler: ({nativeEvent: event}: KeyboardEvent<Element>) => {
        return shouldHandleEvent(event.target as HTMLElement)
      }
    }
  ]
}

export class PointerSensor extends LibPointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({nativeEvent: event}: PointerEvent<Element>) => {
        return shouldHandleEvent(event.target as HTMLElement)
      }
    }
  ]
}

const shouldHandleEvent = (element: HTMLElement | null): boolean => {
  let cur = element

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false
    }

    cur = cur.parentElement
  }

  return true
}
