import { createStore } from 'wohoox-react'

type RevertObjectToArrayUnion<T extends object, K = keyof T> = K extends keyof T
  ? [K, T[K]]
  : unknown

const obj = { name: 'obj' }
const arr = [1, 2]
const map = new Map()
const originSet = new Set()
const weakMap = new WeakMap([[obj, 123]])
const weakSet = new WeakSet()

export default createStore({
  initState: {
    version: '1.x',
    type: 1,
    flag: true,
    set: new Set([obj, arr, map, weakMap, originSet, weakSet]),
    map: new Map(),
  },
  actions: {
    updateByKeyValue(state, ...args: RevertObjectToArrayUnion<typeof state>) {
      const [key, value] = args as [keyof typeof state, never]

      state[key] = value
    },
  },
  options: {
    proxySetDeep: true,
    strictMode: false,
  },
})
