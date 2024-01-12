import type {
  ActionsDefine,
  Options,
  WohooxPlugin,
  ActionDispatch,
} from 'wohoox'
import { createStore as createWohooxStore, DefaultStoreName } from 'wohoox'
import { useWohoox } from './hooks/useWohoox'

import effectListPlugin from './plugins/effectList'

export function createStore<
  S extends object,
  A extends ActionsDefine<S>,
  N extends string = typeof DefaultStoreName,
>({
  name,
  initState,
  actions,
  plugins,
  options,
}: {
  initState: () => S
  name?: N
  plugins?: WohooxPlugin<S, A>[]
  actions?: A
  options?: Options
}): {
  store: {
    name: N
    state: S
    actions: ActionDispatch<
      S,
      A & {
        reset(originState: S, state?: S | undefined): void
      }
    >
  }
  useStore: {
    (): {
      state: S
      actions: ActionDispatch<
        S,
        A & {
          reset(originState: S, state?: S | undefined): void
        }
      >
    }
    <T extends (state: S) => unknown>(getStateFn: T): {
      state: ReturnType<T>
      actions: ActionDispatch<
        S,
        A & {
          reset(originState: S, state?: S | undefined): void
        }
      >
    }
  }
  useWohooxState: {
    (): S
    <T extends (state: S) => unknown>(getStateFn: T): ReturnType<T>
  }
}
export function createStore<
  S extends object,
  A extends ActionsDefine<S>,
  N extends string = typeof DefaultStoreName,
>({
  name,
  initState,
  actions,
  plugins,
  options,
}: {
  initState: S
  name?: N
  plugins?: WohooxPlugin<S, A>[]
  actions?: A
  options?: Options
}): {
  store: {
    name: N
    state: S
    actions: ActionDispatch<
      S,
      A & {
        reset(originState: S, state: S): void
      }
    >
  }
  useStore: {
    (): {
      state: S
      actions: ActionDispatch<
        S,
        A & {
          reset(originState: S, state: S): void
        }
      >
    }
    <T extends (state: S) => unknown>(getStateFn: T): {
      state: ReturnType<T>
      actions: ActionDispatch<
        S,
        A & {
          reset(originState: S, state: S): void
        }
      >
    }
  }
  useWohooxState: {
    (): S
    <T extends (state: S) => unknown>(getStateFn: T): ReturnType<T>
  }
}
export function createStore<
  S extends object,
  A extends ActionsDefine<S>,
  N extends string = typeof DefaultStoreName,
>({
  name = DefaultStoreName as N,
  initState,
  actions,
  plugins,
  options,
}: {
  initState: (() => S) | S
  name?: N
  plugins?: WohooxPlugin<S, A>[]
  actions?: A
  options?: Options
}) {
  const store = createWohooxStore({
    name,
    initState: initState as S,
    actions,
    plugins: [effectListPlugin as WohooxPlugin<S, A>, ...(plugins || [])],
    options,
  })

  function useStore(): { state: S; actions: typeof store.actions }
  function useStore<T extends (state: S) => unknown>(
    fn: T,
  ): { state: ReturnType<T>; actions: typeof store.actions }
  function useStore<T extends (state: S) => unknown>(getStateFn?: T) {
    let state: S | ReturnType<T>

    if (!getStateFn) state = useWohoox(name) as S
    else state = useWohoox(name, getStateFn)

    return {
      state,
      actions: store.actions,
    }
  }

  function useWohooxState(): S
  function useWohooxState<T extends (state: S) => unknown>(fn: T): ReturnType<T>
  function useWohooxState<T extends (state: S) => unknown>(getStateFn?: T) {
    return useStore(getStateFn as T).state
  }

  return {
    store,
    useStore,
    useWohooxState,
  }
}
