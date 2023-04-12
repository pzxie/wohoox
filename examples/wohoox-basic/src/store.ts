import { createStore } from 'wohoox'
import persistPlugin from './plugin/persist'

const store = createStore({
  initState: {
    version: '1.x',
    items: [5],
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
    addItem(state, item) {
      state.items.push(item)
    },
    deleteItem(state) {
      state.items.pop()
    },
    modifySecondItem(state, item) {
      state.items[1] = item
    },
    empty(state) {
      state.items.length = 0
    },
  },
  plugins: [persistPlugin],
})

export const actions = store.actions
export default store
