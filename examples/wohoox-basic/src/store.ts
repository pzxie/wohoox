import { createStore } from 'wohoox'

type RevertObjectToArrayUnion<T extends object, K = keyof T> = K extends keyof T
  ? [K, T[K]]
  : unknown

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
    // You can use the key-value method for unified definition update, and support typescript
    updateByKeyValue(state, ...args: RevertObjectToArrayUnion<typeof state>) {
      const [key, value] = args as [keyof typeof state, any]
      state[key] = value
    },
    empty(state) {
      state.items.length = 0
    },
  },
})

export const actions = store.actions
export default store
