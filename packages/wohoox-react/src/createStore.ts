import type { ActionsDefine, Options, WohooxPlugin } from 'wohoox'
import { createStore as createWohooxStore, defaultStoreName } from 'wohoox'

import effectListPlugin from './plugins/effectList'

export function createStore<
  S extends object,
  A extends ActionsDefine<S>,
  N extends string = typeof defaultStoreName,
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
}) {
  return createWohooxStore({
    name,
    initState,
    actions,
    plugins: [effectListPlugin, ...(plugins || [])],
    options,
  })
}
