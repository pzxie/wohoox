import { combineStores } from 'wohoox-react'

import defaultStore from './default'
import userStore from './user'

const {
  store,
  actions: combineActions,
  useStore,
} = combineStores(defaultStore.store, userStore.store)

export { useStore }
export const actions = combineActions
export default store
