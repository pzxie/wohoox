import { getStores, getStoreByName, DefaultStoreName } from 'wohoox'

export type { WohooxPlugin } from 'wohoox'

export { combineStores } from 'wohoox'
export { createStore } from './createStore'
export { useWohoox as useStore } from './hooks/useWohoox'

export function dispatch(storeName?: string) {
  getStoreByName(storeName || DefaultStoreName)?.dispatch()
}

export function dispatchAll() {
  getStores().forEach(store => store.dispatch())
}
