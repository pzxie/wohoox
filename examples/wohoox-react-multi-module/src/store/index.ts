import { useStore as useWohoox, combineStores } from 'wohoox-react'

import defaultStore from './default'
import userStore from './user'

const { store, actions: combineActions } = combineStores(
  defaultStore,
  userStore,
)

type StoreType = typeof store
type StoreNames = keyof typeof store

export function useStore<N extends StoreNames = 'default'>(
  name?: N,
): StoreType[N]['state']
export function useStore<
  T extends (state: StoreType['default']['state']) => any,
>(fn?: T): ReturnType<T>
export function useStore<
  N extends StoreNames,
  T extends (state: StoreType[N]['state']) => any,
>(name?: N, fn?: T): ReturnType<T>
export function useStore(name?: any, fn?: any) {
  const state = useWohoox(name, fn)

  return state
}

export const actions = combineActions
export default store
