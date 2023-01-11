import { createStore } from './core/store'

export default createStore
export { combineStores } from './core/store'

export { observer } from './core/observer'
export { storeMap, defaultStoreName } from './global'
export { EffectType } from './constant'

export {
  keyCaches_SourceMap,
  keyCaches_StringifiedKeySourceMap,
  keyCaches_KeyJoinSymbol,
} from './core/keyCaches'

export type { WohooxPlugin } from './core/plugin'
export { ignoreToRecordEvent } from './core/plugin'
