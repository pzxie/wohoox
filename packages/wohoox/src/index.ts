import { storeMap, defaultStoreName } from './global'

import { createStore } from './core/store'

export type { WohooxPlugin } from './core/plugin'

export function dispatch(storeName?: string) {
  storeMap.get(storeName || defaultStoreName)?.dispatch()
}

export function dispatchAll() {
  Array.from(storeMap.values()).forEach(store => store.dispatch())
}

export { defaultStoreName } from './global'
export { combineStores } from './core/store'
export { observer } from './core/observer'
export default createStore

export { storeMap } from './global'
export { EffectType } from './constant'
export { isObserverObject } from './utils'
export { ignoreToRecordEvent } from './core/plugin'
