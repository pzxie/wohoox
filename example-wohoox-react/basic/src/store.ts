import createStore, { useStore as useWohoox } from 'wohoox-react'
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

type DefaultState = typeof store.state

export function useStore(name?: string): DefaultState
export function useStore<T extends (state: DefaultState) => any>(
  fn?: T,
): ReturnType<T>
export function useStore<T extends (state: DefaultState) => any>(
  name?: string,
  fn?: T,
): ReturnType<T>
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn)

  return state
}

export const actions = store.actions
export default store
