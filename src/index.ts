import { useState, useEffect, useRef } from 'react';
import useEvent from './hooks/useEvent';
import useId from './hooks/useId';
import useUpdate from './hooks/useUpdate';

const storeMap: Map<string, Store<object, ActionsDefine<object>>> = new Map();

const defaultStoreName = 'default';

let isModifyByAction = false;

type ActionsDefine<S> = {
  [key: string]: ((state: S, ...args: any) => any) | ActionsDefine<S>;
};

type ActionDispatch<S, R> = {
  [K in keyof R]: ExtractDispatcherFromActions<S, R[K]>;
};

type ExtractDispatcherFromActions<TState, TAction> = TAction extends () => any
  ? TAction
  : TAction extends (state: TState, ...args: infer TRest) => any
  ? TRest extends []
    ? () => any
    : (...arg: TRest) => any
  : TAction extends ActionsDefine<TState>
  ? ActionDispatch<TState, TAction>
  : never;

export type Options = { strictMode?: boolean };

function revertActionsToAutoMode<
  TState,
  TActions extends ActionsDefine<TState>
>(state: TState, actions: TActions, autoModeTask = () => {}) {
  const autoModeActions: ActionDispatch<TState, TActions> = Object.assign({});

  for (let actionName in actions) {
    if (typeof actions[actionName] === 'function') {
      autoModeActions[actionName] = ((...args: any) => {
        isModifyByAction = true;
        (actions[actionName] as any)(state, ...args);
        isModifyByAction = false;
        autoModeTask();
      }) as any;
    } else if (typeof actions[actionName] === 'object') {
      autoModeActions[actionName] = revertActionsToAutoMode(
        state,
        actions[actionName] as any,
        autoModeTask
      ) as any;
    }
  }

  return autoModeActions;
}

function proxyFactory<T extends Record<string, any>>(
  source: T,
  options?: {
    getCallback?(value: any, keys: (string | number | symbol | Symbol)[]): void;
    setCallback?(
      value: any,
      keys: (string | number | symbol | Symbol)[]
    ): boolean | undefined | void;
    keysStack?: (string | number | symbol | Symbol)[];
    proxyMap?: WeakMap<any, any>;
  }
) {
  const {
    getCallback = () => {},
    setCallback = () => {},
    keysStack = [],
    proxyMap = new WeakMap(),
  } = options || {};

  if (typeof source !== 'object') return source;

  const proxyObj = proxyMap.get(source);
  if (proxyObj) return proxyObj;

  const proxy: T = new Proxy(source, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      const proxyValue = proxyMap.get(value);
      const keys = [...keysStack, key];

      getCallback(value, keys);

      if (typeof value === 'object' && !proxyValue) {
        return proxyFactory(value, {
          getCallback,
          setCallback,
          keysStack: keys,
          proxyMap,
        });
      }

      return proxyValue || value;
    },
    set(target, key, value, receiver) {
      const keys = [...keysStack, key];
      const isValid = setCallback(value, keys);

      if (isValid === false) return false;

      return Reflect.set(target, key, value, receiver);
    },
  });

  proxyMap.set(source, proxy);

  return proxy;
}

class Store<S extends object, A extends ActionsDefine<S>> {
  private listeners: Array<() => void> = [];

  private options = {
    strictMode: true,
  };

  public state: S;

  // save source state, generate new proxy for every useStore.
  sourceState: S;

  public actions = {} as ActionDispatch<S, A>;

  // recording every components who used store state field
  usedMap: Record<string, Set<string>> = {};

  // Field order when getting deep fields，effectList source
  currentProxyGetKeys: (string | number | symbol | Symbol)[] = [];

  // settled state field list
  effectList: Set<string> = new Set();

  constructor(name: string, state: S, actions?: A, options?: Options) {
    storeMap.set(name, this);
    this.sourceState = state;
    Object.assign(this.options, options);
    this.state = proxyFactory(state, {
      getCallback: (_, keys) => {
        this.currentProxyGetKeys = keys;
      },
      setCallback: (_, keys) => {
        if (!isModifyByAction && this.options.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed'
          );
        }

        this.effectList.add(keys.join('.'));
      },
    });

    if (actions)
      this.actions = revertActionsToAutoMode(this.state, actions, () => {
        this.applyRender();
        this.effectList.clear();
      });
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

  getOptions() {
    return this.options;
  }
}

export function useStore(storeName?: string): any;
export function useStore<T extends (state: any) => any>(
  getState?: T
): ReturnType<T>;
export function useStore<T extends (state: any) => any>(
  storeName: string,
  getState: T
): ReturnType<T>;
export function useStore(name?: any, getState?: any): any {
  const storeName = typeof name === 'string' ? name : defaultStoreName;

  const [, update] = useState({});
  const id = useId();

  const getStateFn = useEvent(
    typeof name === 'function'
      ? name
      : typeof getState === 'function'
      ? getState
      : (state: any) => state
  );

  const preState = useRef();
  const [store, setStore] = useState(() => storeMap.get(storeName));

  if (!store) {
    const storeKeys = [...storeMap.keys()];

    if (!storeKeys.length)
      throw new Error(
        'Please check the store has been initialized correctly. \nget store:【' +
          storeName +
          ('】\nexist stores:【' + [...storeMap.keys()] + '】')
      );

    throw new Error(
      'cannot get the correct store。\nget store:【' +
        storeName +
        ('】\nexist stores:【' + [...storeMap.keys()] + '】')
    );
  }

  const getStateProxy = useEvent(() => {
    const state = getStateFn(store.state);
    const currentPrefixKeys = [...store.currentProxyGetKeys];

    return proxyFactory(getStateFn(store.sourceState), {
      getCallback(_, keys) {
        try {
          store.currentProxyGetKeys = keys;
          const key = keys.join('.');
          if (!store.usedMap[key]) {
            store.usedMap[key] = new Set([id]);
          } else {
            store.usedMap[key].add(id);
          }
        } catch (e) {}
      },
      setCallback: (_, keys) => {
        if (store.getOptions().strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed'
          );
        }
        store.effectList.add(keys.join('.'));
      },
      keysStack: state === store.state ? [] : currentPrefixKeys,
    });
  });

  const [state, setState] = useState(getStateProxy);

  useUpdate(() => {
    // 只在 component update 时调用，否则，会造成初始化时。渲染两次的问题

    // 主要用于开发环境，
    // 只有开发环境下，才可能手动变更 storeName ，导致 store 变更，需要重新进行数据代理设置
    // 生产环境下，storeName 除非动态获取，否则不会变更
    setStore(storeMap.get(storeName));
  }, [storeName]);

  useUpdate(() => {
    // 只在 component update 时调用，否则，会造成初始化时。渲染两次的问题

    // store变更后，重新初始化
    // 主要用于开发环境，
    // 只有开发环境下，才可能手动变更 storeName ，导致 store 变更，需要重新进行数据代理设置
    // 生产环境下，下面几个都不会变更，也就无作用
    setState(getStateProxy);
  }, [id, getStateFn, store, getStateProxy]);

  useEffect(() => {
    if (!id) return;

    preState.current = getStateFn(store.state);

    const callback = () => {
      const state = getStateFn(store.state);

      // state自身变更，需要重设值
      if (state !== preState.current) {
        preState.current = state;
        setState(state);
        // update({});
      }

      // state子属性变更，只需要触发重新渲染，就能拿到最新值
      for (let key of store.effectList) {
        if (store.usedMap[key] && store.usedMap[key].has(id)) {
          preState.current = state;
          update({});
          store.usedMap[key].delete(id);
        }
      }
    };
    store.addListener(callback);
    return () => {
      store.removeListener(callback);
    };
  }, [getStateFn, id, store]);

  return state;
}

export default function createStore<
  S extends object,
  A extends ActionsDefine<S>
>({
  name = defaultStoreName,
  initState,
  actions,
  options,
}: {
  name?: string;
  initState: S;
  actions?: A;
  options?: Options;
}) {
  const store = new Store(name, initState, actions, options);

  return {
    name,
    state: store.state,
    actions: store.actions,
  };
}
