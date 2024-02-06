import { isPlainObject } from 'wohoox-utils'

import {
  addStore,
  getStoreByName,
  getIsModifyByAction,
  setIsModifyByAction,
  DefaultStoreName,
} from '../global'
import { observer } from './observer'
import { addPlugins, getPlugins } from './plugin'

import type {
  Options,
  WohooxPlugin,
  ActionsDefine,
  ActionDispatch,
  ExtractStoresName,
  ExtractStores,
} from '../types'

const NOT_SAFE_DISPATCH = '__not_safe__dispatch'

function isActionFunction(fn: any): fn is (state: any, ...args: any) => any {
  return fn instanceof Function
}

function revertActionsToAutoMode<
  TState extends object,
  TActions extends ActionsDefine<TState, TActions>,
>(storeName: string, actions: TActions, autoModeTask = () => {}) {
  const autoModeActions: ActionDispatch<TState, TActions> = Object.assign({})

  for (const actionName in actions) {
    const action = actions[actionName]
    if (isActionFunction(action)) {
      autoModeActions[actionName] = ((...args: unknown[]) => {
        const store = getStoreByName(storeName)

        if (!store) {
          console.warn(`There is not exist a store named ${storeName}.`)
          return
        }

        setIsModifyByAction(true)
        action({ state: store.state, actions: store.actions }, ...args)
        setIsModifyByAction(false)
        autoModeTask()
      }) as any
    } else if (isPlainObject(action)) {
      autoModeActions[actionName] = revertActionsToAutoMode(
        storeName,
        action as any,
        autoModeTask,
      ) as any
    }
  }

  return autoModeActions
}

export class Store<
  N extends string,
  S extends object,
  A extends ActionsDefine<S, A>,
> {
  private listeners: Array<() => void> = []

  private options = {
    strictMode: true,
    proxySetDeep: false,
  }

  public state!: S

  // Save source state to generate new proxy for every useStore.
  sourceState!: S

  public actions: ActionDispatch<S, A> = Object.assign({})

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
      } as A,
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

  clearListener() {
    this.listeners = []
  }

  addKeyToEffectList(type: 'add' | 'delete' | 'set', keys: any[]) {
    this.effectList[type].add(keys)

    const parentKeys = keys.slice(0, -1)

    if (parentKeys.length && type === 'add') this.effectList.add.add(parentKeys)
  }

  getOptions() {
    return { ...this.options }
  }
}

export function createStore<
  S extends object,
  A extends ActionsDefine<S, A>,
  N extends string = typeof DefaultStoreName,
>(config: {
  initState: () => S
  name?: N
  actions?: A
  plugins?: WohooxPlugin<S, A>[]
  options?: Options
}): {
  name: N
  state: Store<
    N,
    S,
    A & {
      reset(store: { state: S; actions: ActionDispatch<S, A> }, state?: S): void
    }
  >['state']
  actions: Store<
    N,
    S,
    A & {
      reset(store: { state: S; actions: ActionDispatch<S, A> }, state?: S): void
    }
  >['actions']
}

export function createStore<
  S extends object,
  A extends ActionsDefine<S, A>,
  N extends string = typeof DefaultStoreName,
>(config: {
  initState: S
  name?: N
  actions?: A
  plugins?: WohooxPlugin<S, A>[]
  options?: Options
}): {
  name: N
  state: Store<
    N,
    S,
    A & {
      reset(store: { state: S; actions: ActionDispatch<S, A> }, state: S): void
    }
  >['state']
  actions: Store<
    N,
    S,
    A & {
      reset(store: { state: S; actions: ActionDispatch<S, A> }, state: S): void
    }
  >['actions']
}

export function createStore<
  S extends object,
  A extends ActionsDefine<S, A>,
  N extends string = typeof DefaultStoreName,
>({
  name = DefaultStoreName as N,
  initState,
  actions = Object.assign({}),
  plugins,
  options,
}: {
  initState: (() => S) | S
  name?: N
  actions?: A
  plugins?: WohooxPlugin<S, A>[]
  options?: Options
}) {
  const initStateFn =
    initState instanceof Function ? initState : () => initState
  addPlugins(name, ...(plugins || []))

  if (typeof actions.reset === 'function') {
    console.warn(
      'The action named [reset] is a built-in action of wohoox. If you declared [reset], it will be ignored.',
    )
  }

  const initObj = {
    initState: initStateFn(),
    actions: {
      ...actions,
      reset(_store: { state: S; actions: ActionDispatch<S, A> }, _state?: S) {},
    },
  }

  const pluginsObjArr = getPlugins(name) || []

  const beforeInitResult =
    pluginsObjArr.reduce((pre, plugin) => {
      if (plugin.beforeInit) {
        const beforeInitData = plugin.beforeInit?.(pre.initState, pre.actions)

        return {
          initState: { ...pre.initState, ...beforeInitData?.initState },
          actions: {
            ...pre.actions,
            ...beforeInitData?.actions,
          },
        }
      }

      return pre
    }, initObj) || initObj

  beforeInitResult.actions.reset = ({ state: _originState }, state) => {
    const store = getStoreByName(name)
    const newState = state || initStateFn()

    store?.initStateAndActions(name, newState)

    pluginsObjArr?.forEach(plugin =>
      plugin.onReset?.(name, newState, _originState),
    )
  }

  const store = new Store(
    name,
    beforeInitResult.initState,
    beforeInitResult.actions,
    options,
  )

  pluginsObjArr?.forEach(plugin =>
    plugin.onInit?.({
      name,
      state: store.state,
      actions: store.actions,
    }),
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
  const allStore: { [K in ExtractStoresName<S>]: ExtractStores<S, K> } =
    Object.assign({})

  stores.forEach(store => (allStore[store.name] = store))

  const actions = Object.keys(allStore).reduce((pre, current) => {
    const store: S = allStore[current]

    pre[current] = store['actions']

    return pre
  }, {} as { [K in ExtractStoresName<S>]: typeof allStore[K]['actions'] })

  return {
    store: allStore,
    actions,
  }
}

const plu: WohooxPlugin<
  { version: string },
  { addItem(s, p): void; deep: { add(s, item): void } }
> = () => {
  return {
    beforeInit(state, actions) {
      return {
        initState: {
          version: state.version,
        },
        actions: {
          addItem({ state, actions: a }, p) {
            actions.deep.add({ state, actions: a }, p)
            actions.addItem({ state, actions: a }, p)
            a.addItem(p)
            a.deep.add(p)
          },
        },
      }
    },
  }
}

const store = createStore({
  initState: {
    version: '1.x',
    items: [5],
  },
  actions: {
    updateVersion({ state, actions }, version) {
      state.version = version
      actions.addItem
    },
    addItem({ state }, item: number) {
      state.items.push(item)
    },
    deleteItem({ state }) {
      state.items.pop()
    },
    modifySecondItem({ state }, item) {
      state.items[1] = item
    },
    empty({ state }) {
      state.items.length = 0
    },
    test: {
      set({ state, actions }, i) {
        state.items = i
      },
    },
  },
  plugins: [
    () => {
      return {
        beforeInit(state, actions) {
          return {
            initState: {
              version: state.version,
            },
            actions: {
              addItem({ state, actions: a }, p) {
                actions.test.set({ state, actions: a }, p)
                actions.test.set({ state, actions: a }, p)
                actions.addItem({ state, actions: a }, p)
                actions.addItem({ state, actions: a }, p)
                a.addItem(p)
                a.test.set(p)
              },
            },
          }
        },
      }
    },
  ],
})

store.actions.reset({
  version: '1.3',
  items: [43],
})
