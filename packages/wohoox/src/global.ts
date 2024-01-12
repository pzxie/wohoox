import type { ActionsDefine } from './types'
import type { Store } from './core/store'
import { clearPlugins } from './core/plugin'

export const MapSetSizeKey = '__size'
export const DefaultStoreName = 'default'

export const StoreMap: Map<
  string,
  Store<string, object, ActionsDefine<object>>
> = new Map()

export function getStoreByName(name: string) {
  return StoreMap.get(name)
}

export function getStores() {
  return Array.from(StoreMap.values())
}

export function getStoreNames() {
  return Array.from(StoreMap.keys())
}

export function addStore(
  name: string,
  store: Store<string, object, ActionsDefine<object>>,
) {
  StoreMap.set(name, store)
}

export function clearStore() {
  StoreMap.clear()
  clearPlugins()
}

let isModifyByAction = false

export function getIsModifyByAction() {
  return isModifyByAction
}

export function setIsModifyByAction(flag: boolean) {
  isModifyByAction = flag
}
