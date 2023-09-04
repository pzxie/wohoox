import { combineStores } from 'wohoox'

import defaultStore from './default'
import userStore from './user'

const { store } = combineStores(defaultStore, userStore)

export default store
