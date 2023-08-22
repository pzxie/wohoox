import { createStore } from 'wohoox'
import persistPlugin from './plugin/persist'

const store = createStore({
  initState: {
    version: '1.x',
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
  },
  plugins: [persistPlugin],
})

export const actions = store.actions
export default store
