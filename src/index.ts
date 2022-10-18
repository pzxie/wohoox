import { useState, useEffect, useRef } from 'react';
import useEvent from './hooks/useEvent';
import useId from './hooks/useId';
import useUpdate from './hooks/useUpdate';

const storeMap: Map<string, Store<object, Actions>> = new Map();

const defaultStoreName = 'default';

export type Actions = {
  [key: string]: ((...args: any) => any) | Actions;
};

export type Options = { strictMode?: boolean };

function revertActionsToAutoMode<Actions>(actions: Actions, autoModeTask = () => {}): Actions {
  const autoModeActions = {} as Actions;

  for (let actionName in actions) {
    if (typeof actions[actionName] === 'function') {
      autoModeActions[actionName] = ((...args: any) => {
        (actions[actionName] as any)(...args);
        autoModeTask();
      }) as any;
    } else {
      autoModeActions[actionName] = revertActionsToAutoMode(actions[actionName], autoModeTask);
    }
  }

  return autoModeActions;
}

function proxyFactory<T extends Record<string, any>>(
  source: T,
  options?: {
    getCallback?(value: any, keys: string[]): void;
    setCallback?(value: any, keys: string[]): boolean | undefined | void;
    keysStack?: string[];
    proxyMap?: WeakMap<any, any>;
  }
) {
  const { getCallback = () => {}, setCallback = () => {}, keysStack = [], proxyMap = new WeakMap() } = options || {};

  if (typeof source !== 'object') return source;

  const proxyObj = proxyMap.get(source);
  if (proxyObj) return proxyObj;

  const proxy: T = new Proxy(source, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      const proxyValue = proxyMap.get(value);
      const keys = [...keysStack, key];

      getCallback(value, keys as string[]);

      if (typeof value === 'object' && !proxyValue) {
        return proxyFactory(value, {
          getCallback,
          setCallback,
          keysStack: keys as string[],
          proxyMap,
        });
      }

      return proxyValue || value;
    },
    set(target, key, value, receiver) {
      const keys = [...keysStack, key];
      const isValid = setCallback(value, keys as string[]);

      if (isValid === false) return false;

      return Reflect.set(target, key, value, receiver);
    },
  });

  proxyMap.set(source, proxy);

  return proxy;
}

class Store<T extends object, A extends Actions> {
  private listeners: Array<() => void> = [];

  private options = {
    strictMode: true,
  };

  sourceState;

  currentProxyGetKeys: string[] = [];

  usedMap: Record<string, Set<string>> = {};

  effectList: Set<string> = new Set();

  public actions = {} as A;

  constructor(name: string, public state: T, actions?: A, options?: Options) {
    storeMap.set(name, this);
    this.sourceState = state;
    Object.assign(this.options, options);
    this.state = proxyFactory(state, {
      getCallback: (_, keys) => {
        this.currentProxyGetKeys = keys as string[];
      },
      setCallback: (_, keys) => {
        this.effectList.add(keys.join('.'));
      },
    });

    if (actions)
      this.actions = revertActionsToAutoMode(actions, () => {
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

export function useRestore(): any;
export function useRestore(storeName: string): any;
export function useRestore<T extends (state: any) => any>(getState?: T, storeName?: string): ReturnType<T>;
export function useRestore(getState?: any, name?: string): any {
  const storeName = typeof getState === 'string' ? getState : name || defaultStoreName;

  const [, update] = useState({});
  const id = useId();

  const getStateFn = useEvent(typeof getState === 'function' ? getState : state => state);

  const preState = useRef();

  const [store, setStore] = useState(() => storeMap.get(storeName));

  if (!store) {
    const storeKeys = [...storeMap.keys()];

    if (!storeKeys.length)
      throw new Error(
        '请检查是否已经正确初始化store \n获取的 store 为：【' +
          storeName +
          ('】\n实际存在的 store：【' + [...storeMap.keys()] + '】')
      );

    throw new Error(
      '未获取到正确的store。\n获取的 store 为：【' +
        storeName +
        ('】\n实际存在的 store：【' + [...storeMap.keys()] + '】')
    );
  }

  const getStateProxy = useEvent(() => {
    const state = getStateFn(store.state);
    const currentPrefixKeys = [...store.currentProxyGetKeys];

    return proxyFactory(getStateFn(store.sourceState), {
      getCallback(_, keys) {
        try {
          store.currentProxyGetKeys = keys as string[];
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
          throw new Error('严格模式下，不能直接修改 state，只能通过 actions 进行修改');
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

export default function createStore<T extends object, A extends Actions>({
  name = defaultStoreName,
  initState,
  actions,
  options,
}: {
  name?: string;
  initState: T;
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
