import { ActionsDefine } from './types'
import type { Store } from './core/store'

export const MapSetSizeKey = '__size'
export const defaultStoreName = 'default'

export const storeMap: Map<
  string,
  Store<string, object, ActionsDefine<object>>
> = new Map()

let isModifyByAction = false

export function getIsModifyByAction() {
  return isModifyByAction
}

export function setIsModifyByAction(flag: boolean) {
  isModifyByAction = flag
}
