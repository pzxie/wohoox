import createStore from 'wohoox'

export default createStore

export { useWohoox as useStore } from './hooks/useWohoox'
export { combineStores, dispatch, dispatchAll } from 'wohoox'
export type { WohooxPlugin } from 'wohoox'
