import { storeMap, getIsModifyByAction, setIsModifyByAction, defaultStoreName } from '../global';
import { observer } from './observer';
import { isPlainObject } from '../utils';
import { EffectType } from '../constant';
import { getSourceByStringifyKey } from '../core/keyStore';
import { addPlugins } from './plugin';

import type { WohooxPlugin } from './plugin';

import type { ActionsDefine, ActionDispatch, ExtractStoresName, ExtractStores } from '../types';

export type Options = { strictMode?: boolean; proxySetDeep?: boolean };

function revertActionsToAutoMode<TState, TActions extends ActionsDefine<TState>>(
  state: TState,
  actions: TActions,
  autoModeTask = () => {},
) {
  const autoModeActions: ActionDispatch<TState, TActions> = Object.assign({});

  for (let actionName in actions) {
    if (typeof actions[actionName] === 'function') {
      autoModeActions[actionName] = ((...args: any) => {
        setIsModifyByAction(true);
        (actions[actionName] as any)(state, ...args);
        setIsModifyByAction(false);
        autoModeTask();
      }) as any;
    } else if (isPlainObject(actions[actionName])) {
      autoModeActions[actionName] = revertActionsToAutoMode(
        state,
        actions[actionName] as any,
        autoModeTask,
      ) as any;
    }
  }

  return autoModeActions;
}

export class Store<N extends string, S extends object, A extends ActionsDefine<S>> {
  private listeners: Array<() => void> = [];

  private options = {
    strictMode: true,
    proxySetDeep: false,
  };

  public state: S;

  // Save source state to generate new proxy for every useStore.
  sourceState: S;

  public actions = {} as ActionDispatch<S, A>;

  // Properties stack to record current visited properties，effectList source
  currentProxyGetKeys: string[] = [];

  // settled state property list
  effectList: Set<string> = new Set();

  effectUpdateList: Set<string> = new Set();

  dispatch = () => {};

  constructor(name: N, state: S, actions?: A, options?: Options) {
    storeMap.set(name, this);
    this.sourceState = state;
    Object.assign(this.options, options);

    this.state = observer(state, {
      getCallback: (_, keys) => {
        this.currentProxyGetKeys = keys;
      },
      setCallback: (value, keys, target, oldValue) => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        this.addKeyToEffectList(keys, value, EffectType.modify);
      },
      addCallback: (value, keys) => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        this.addKeyToEffectList(keys, value, EffectType.add);
      },
      deleteCallback: (target, keys) => {
        if (!getIsModifyByAction() && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be delete by expression. Only actions are allowed',
          );
        }

        this.addKeyToEffectList(keys, target, EffectType.delete);
      },
      proxySetDeep: this.options.proxySetDeep,
      name,
    });

    this.actions = revertActionsToAutoMode(
      this.state,
      { ...actions!, __not_safe__dispatch: () => {} },
      () => {
        this.applyRender();
        this.effectList.clear();
        this.effectUpdateList.clear();
      },
    );

    this.dispatch = this.actions.__not_safe__dispatch as () => any;

    delete this.actions.__not_safe__dispatch;
  }

  private applyRender() {
    this.listeners.forEach(listener => listener());
  }

  addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void) {
    const index = this.listeners.indexOf(listener);

    if (index > -1) this.listeners.splice(index, 1);
  }

  addKeyToEffectList(keys: string[], newValue: any, effectType: EffectType) {
    if (!keys.length) return;

    if (effectType === EffectType.add || !keys.find(key => getSourceByStringifyKey(key))) {
      this.effectList.add(keys.join('.'));

      const parentKeys = keys.slice(0, -1);

      if (parentKeys.length) this.effectList.add(parentKeys.join('.'));
    } else this.effectUpdateList.add(keys.join('.'));
  }

  getOptions() {
    return { ...this.options };
  }
}

export function createStore<
  S extends object,
  A extends ActionsDefine<S>,
  N extends string = typeof defaultStoreName,
>({
  name = defaultStoreName as N,
  initState,
  actions,
  plugins,
  options,
}: {
  initState: S;
  name?: N;
  plugins?: WohooxPlugin[];
  actions?: A;
  options?: Options;
}) {
  addPlugins(name, ...(plugins || []));
  const beforeInitResult = plugins?.reduce(
    (pre, plugin) =>
      plugin.beforeInit?.(pre.initState, pre.actions) || {
        initState: pre.initState,
        actions: pre.actions,
      },
    { initState, actions },
  ) || { initState, actions };

  const store = new Store(name, beforeInitResult.initState, beforeInitResult.actions, options);

  plugins?.forEach(plugin => plugin.onInit?.({ name, state: store.state, actions: store.actions }));

  return {
    name,
    state: store.state,
    actions: store.actions,
  };
}

export function combineStores<S extends ReturnType<typeof createStore>[]>(...stores: S) {
  const allStore = {} as { [K in ExtractStoresName<S>]: ExtractStores<S, K> };

  stores.forEach(store => (allStore[store.name] = store));

  const actions = Object.keys(allStore).reduce((pre, current) => {
    pre[current] = allStore[current]['actions'];
    return pre;
  }, {} as { [K in ExtractStoresName<S>]: typeof allStore[K]['actions'] });

  return {
    store: allStore,
    actions,
  };
}
