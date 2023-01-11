import createStore, { storeMap, defaultStoreName } from 'wohoox'

export default createStore
export { combineStores } from 'wohoox'
export type { WohooxPlugin } from 'wohoox'

export function dispatch(storeName?: string) {
  storeMap.get(storeName || defaultStoreName)?.dispatch()
}

export function dispatchAll() {
  Array.from(storeMap.values()).forEach(store => store.dispatch())
}

export { useWohoox as useStore } from './hooks/useWohoox'
