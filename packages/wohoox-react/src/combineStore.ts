import type { ExtractStoresName } from 'wohoox'
import { combineStores as wohooxCombineStores } from 'wohoox'
import { useWohoox } from './hooks/useWohoox'

export function combineStores<
  T extends { name: string; state: object; actions: object }[],
>(...stores: T) {
  const allStores = wohooxCombineStores(...stores)

  function useStore<N extends ExtractStoresName<typeof stores>>(
    name: N,
  ): {
    state: typeof allStores.store[N]['state']
    actions: typeof allStores.store[N]['actions']
  }
  function useStore<
    N extends ExtractStoresName<typeof stores>,
    T extends (state: typeof allStores.store[N]['state']) => unknown,
  >(
    name: N,
    fn: T,
  ): { state: ReturnType<T>; actions: typeof allStores.store[N]['actions'] }
  function useStore<
    N extends ExtractStoresName<typeof stores>,
    T extends (state: typeof allStores.store[N]['state']) => unknown,
    S = typeof allStores.store[N]['state'],
  >(name: N, getStateFn?: T) {
    let state: S | ReturnType<T>

    if (!name) {
      throw new Error(
        'The first parameter of useStore returned by combineStores is required.',
      )
    }

    if (!getStateFn) state = useWohoox(name) as S
    else state = useWohoox(name, getStateFn)

    return {
      state,
      actions: allStores.store[name].actions,
    }
  }

  function useWohooxState<N extends ExtractStoresName<typeof stores>>(
    name: N,
  ): typeof allStores.store[N]['state']
  function useWohooxState<
    N extends ExtractStoresName<typeof stores>,
    T extends (state: typeof allStores.store[N]['state']) => unknown,
  >(name: N, fn: T): ReturnType<T>
  function useWohooxState<
    N extends ExtractStoresName<typeof stores>,
    T extends (state: typeof allStores.store[N]['state']) => unknown,
  >(name: N, getStateFn?: T) {
    return useStore(name, getStateFn as T).state
  }

  return {
    ...allStores,
    useStore,
    useWohooxState,
  }
}
