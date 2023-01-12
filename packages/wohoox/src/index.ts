import { createStore } from './core/store'

export default createStore
export { combineStores } from './core/store'

export { observer } from './core/observer'
export { storeMap, defaultStoreName } from './global'

export { isIgnoreToGetCallback } from './core/keyCaches'

export type { WohooxPlugin } from './core/plugin'
export { ignoreToRecordEvent } from './core/plugin'
