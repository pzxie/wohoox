import { ActionsDefine } from 'wohoox/src/types'
import { Options } from 'wohoox/src/core/store'
import createWohooxStore, { defaultStoreName, WohooxPlugin } from 'wohoox'

import effectListPlugin from './plugins/effectList'

function createStore<
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

export default createStore
