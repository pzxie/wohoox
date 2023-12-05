import type {
  ActionsDefine,
  Options,
  WohooxPlugin,
  ActionDispatch,
} from 'wohoox'
import { createStore as createWohooxStore, DefaultStoreName } from 'wohoox'

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
  plugins?: WohooxPlugin[]
  actions?: A
  options?: Options
}): {
  name: N
  state: S
  actions: ActionDispatch<
    S,
    A & {
      reset(originState: S, state?: S | undefined): void
    }
  >
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
  plugins?: WohooxPlugin[]
  actions?: A
  options?: Options
}): {
  name: N
  state: S
  actions: ActionDispatch<
    S,
    A & {
      reset(originState: S, state: S): void
    }
  >
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
  initState: (() => S) | S
  name?: N
  plugins?: WohooxPlugin[]
  actions?: A
  options?: Options
}) {
  return createWohooxStore({
    name,
    initState: initState as S,
    actions,
    plugins: [effectListPlugin, ...(plugins || [])],
    options,
  })
}
