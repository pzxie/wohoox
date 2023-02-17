import { storeMap, defaultStoreName } from 'wohoox'

export { combineStores } from 'wohoox'
export type { WohooxPlugin } from 'wohoox'

import createStore from './createStore'
export default createStore
export { useWohoox as useStore } from './hooks/useWohoox'

export function dispatch(storeName?: string) {
  storeMap.get(storeName || defaultStoreName)?.dispatch()
}

export function dispatchAll() {
  Array.from(storeMap.values()).forEach(store => store.dispatch())
}
