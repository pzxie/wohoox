import createStore from 'wohoox'
import persistPlugin from './plugin/persist'

const store = createStore({
  initState: {
    version: '1.x',
    details: {
      name: 'wohoox',
      other: 'xxx',
    },
    set: new Set([1]),
  },
  actions: {
    updateVersion(state, version: string) {
      state.version = version
    },
    addItem(state, item) {
      state.set.add(item)
    },
    empty(state) {
      state.set.clear()
    },
  },
  plugins: [persistPlugin],
  options: {
    strictMode: false,
    proxySetDeep: true,
  },
})

export const actions = store.actions
export default store
