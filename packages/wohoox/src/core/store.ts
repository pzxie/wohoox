import { isPlainObject } from 'wohoox-utils'

import {
  addStore,
  getStoreByName,
  getIsModifyByAction,
  setIsModifyByAction,
  DefaultStoreName,
} from '../global'
import { observer } from './observer'
import { addPlugins } from './plugin'

import type {
  Options,
  WohooxPlugin,
  ActionsDefine,
  ActionDispatch,
  ExtractStoresName,
  ExtractStores,
} from '../types'

const NOT_SAFE_DISPATCH = '__not_safe__dispatch'

function revertActionsToAutoMode<
  TState,
  TActions extends ActionsDefine<TState>,
>(storeName: string, actions: TActions, autoModeTask = () => {}) {
  const autoModeActions: ActionDispatch<TState, TActions> = Object.assign({})

  for (const actionName in actions) {
    if (typeof actions[actionName] === 'function') {
      autoModeActions[actionName] = ((...args: any) => {
        const store = getStoreByName(storeName)
        setIsModifyByAction(true)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ;(actions[actionName] as any)(store!.state, ...args)
        setIsModifyByAction(false)
        autoModeTask()
      }) as any
    } else if (isPlainObject(actions[actionName])) {
      autoModeActions[actionName] = revertActionsToAutoMode(
        storeName,
        actions[actionName] as any,
        autoModeTask,
      ) as any
    }
  }

  return autoModeActions
}

export class Store<
  N extends string,
  S extends object,
  A extends ActionsDefine<S>,
> {
  private listeners: Array<() => void> = []

  private resetListeners: Array<() => void> = []

  private options = {
    strictMode: true,
    proxySetDeep: false,
  }

  public state!: S

  // Save source state to generate new proxy for every useStore.
  sourceState!: S

  public actions = {} as ActionDispatch<S, A>

  // Properties stack to record current visited properties，effectList source
  currentProxyGetKeys: any[] = []

  // settled state property list
  effectList: { add: Set<any>; delete: Set<any>; set: Set<any> } = {
    add: new Set(),
    delete: new Set(),
    set: new Set(),
  }

  dispatch = () => {}

  constructor(name: N, state: S, actions?: A, options?: Options) {
    const existStore = getStoreByName(name)

    if (existStore) {
      console.warn(
        `A store named [${name}] has been declared.\nIf multiple stores with the same name are declared, only the last declared store will take effect, and the others will be overwritten.`,
      )
    }

    addStore(name, this)
    Object.assign(this.options, options)

    this.initStateAndActions(name, state)

    this.actions = revertActionsToAutoMode(
      name,
      {
        ...actions!,
        [NOT_SAFE_DISPATCH]: () => {},
      },
      () => {
        this.applyRender()
        this.effectList.add.clear()
        this.effectList.delete.clear()
        this.effectList.set.clear()
      },
    )

    this.dispatch = this.actions[NOT_SAFE_DISPATCH] as () => any

    delete this.actions[NOT_SAFE_DISPATCH]
  }

  initStateAndActions(name: N, state: S) {
    this.sourceState = state

    this.state = observer(state, {
      getCallback: (_, keys) => {
        if (keys) this.currentProxyGetKeys = keys
      },
      setCallback: () => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          )
        }
      },
      addCallback: () => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          )
        }
      },
      deleteCallback: () => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be delete by expression. Only actions are allowed',
          )
        }
      },
      proxySetDeep: this.options.proxySetDeep,
      name,
    })

    this.resetListeners.forEach(fn => fn())
  }

  private applyRender() {
    this.listeners.forEach(listener => listener())
  }

  addListener(listener: () => void) {
    this.listeners.push(listener)
  }

  removeListener(listener: () => void) {
    const index = this.listeners.indexOf(listener)

    if (index > -1) this.listeners.splice(index, 1)
  }

  addKeyToEffectList(type: 'add' | 'delete' | 'set', keys: any[]) {
    this.effectList[type].add(keys)

    const parentKeys = keys.slice(0, -1)

    if (parentKeys.length && type === 'add') this.effectList.add.add(parentKeys)
  }

  addResetListener(listener: () => void) {
    this.resetListeners.push(listener)
  }

  removeResetListener(listener: () => void) {
    const index = this.resetListeners.indexOf(listener)

    if (index > -1) this.resetListeners.splice(index, 1)
  }

  getOptions() {
    return { ...this.options }
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
  initState: () => S
  name?: N
  plugins?: WohooxPlugin[]
  actions?: A
  options?: Options
}): {
  name: N
  state: Store<
    N,
    S,
    A & {
      reset(originState: S, state?: S): void
    }
  >['state']
  actions: Store<
    N,
    S,
    A & {
      reset(originState: S, state?: S): void
    }
  >['actions']
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
  state: Store<
    N,
    S,
    A & {
      reset(originState: S, state: S): void
    }
  >['state']
  actions: Store<
    N,
    S,
    A & {
      reset(originState: S, state: S): void
    }
  >['actions']
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
  plugins?: WohooxPlugin[]
  actions?: A
  options?: Options
}) {
  const initStateFn: () => S =
    initState instanceof Function ? initState : () => initState
  addPlugins(name, ...(plugins || []))

  const baseIsFn = { initState: initStateFn(), actions } as {
    initState: S
    actions: A & {
      reset(originState: S, state?: S): void
    }
  }

  const baseIsObject = { initState: initStateFn(), actions } as {
    initState: S
    actions: A & {
      reset(originState: S, state: S): void
    }
  }

  const beforeInitResult =
    plugins?.reduce(
      (pre, plugin) =>
        plugin.beforeInit?.(pre.initState, pre.actions) || {
          initState: pre.initState,
          actions: pre.actions,
        },
      typeof initState === 'function' ? baseIsFn : baseIsObject,
    ) || (typeof initState === 'function' ? baseIsFn : baseIsObject)

  if (!beforeInitResult.actions)
    beforeInitResult.actions = {} as typeof beforeInitResult.actions

  if (typeof beforeInitResult.actions.reset === 'function') {
    console.warn(
      'The action named [reset] is a built-in action of wohoox. If you declared [reset], it will be ignored.',
    )
  }

  beforeInitResult.actions.reset = (_originState, state) => {
    const store = getStoreByName(name)
    const newState = state || initStateFn()

    store?.initStateAndActions(name, newState)

    plugins?.forEach(plugin => plugin.onReset?.(name, newState, _originState))
  }

  const store = new Store(
    name,
    beforeInitResult.initState,
    beforeInitResult.actions,
    options,
  )

  plugins?.forEach(plugin =>
    plugin.onInit?.({ name, state: store.state, actions: store.actions }),
  )

  // Dynamic to get current store
  return {
    name,
    get state() {
      return store.state
    },
    get actions() {
      return store.actions
    },
  }
}

export function combineStores<
  S extends { name: string; state: object; actions: object }[],
>(...stores: S) {
  const allStore = {} as { [K in ExtractStoresName<S>]: ExtractStores<S, K> }

  stores.forEach(store => (allStore[store.name] = store))

  const actions = Object.keys(allStore).reduce((pre, current) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    pre[current] = allStore[current]['actions']
    return pre
  }, {} as { [K in ExtractStoresName<S>]: typeof allStore[K]['actions'] })

  return {
    store: allStore,
    actions,
  }
}
