import { useState, useEffect, useRef } from 'react';
import useEvent from './common/useEvent';
import useId from './common/useId';
import useUpdate from './common/useUpdate';
import { useStore } from './useStore';

import { observer } from '../core/observer';
import { isObserverObject } from '../utils';
import { defaultStoreName } from '../global';

export function useWohoox(storeName?: string): any;
export function useWohoox<T extends (state: any) => any>(getState?: T): ReturnType<T>;
export function useWohoox<T extends (state: any) => any>(
  storeName: string,
  getState: T,
): ReturnType<T>;
export function useWohoox(name?: any, getState?: any): any {
  const storeName = typeof name === 'string' ? name : defaultStoreName;

  const [, update] = useState({});
  const id = useId();
  const store = useStore(storeName);

  const getStateFn = useEvent(
    typeof name === 'function'
      ? name
      : typeof getState === 'function'
      ? getState
      : (state: any) => state,
  );

  const getObserverState = useEvent(() => {
    const state = getStateFn(store.state);
    const currentPrefixKeys = [...store.currentProxyGetKeys];

    // use the same target with store state
    return observer(getStateFn(store.sourceState), {
      getCallback(value, keys) {
        try {
          store.currentProxyGetKeys = keys;
          const key = keys.join('.');

          store.addKeyToUsedMap(key, id);

          if (Array.isArray(value)) {
            store.addKeyToUsedMap([...keys, 'length'].join('.'), id);
          }
        } catch (e) {}
      },
      setCallback: (_, keys) => {
        if (store.getOptions().strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }
        store.effectList.add(keys.join('.'));
      },
      deleteCallback: (_, keys) => {
        if (store.getOptions().strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }
        store.effectList.add(keys.join('.'));
      },
      keysStack: state === store.state ? [] : currentPrefixKeys,
    });
  });

  const preState = useRef();
  const [state, setState] = useState(getObserverState);
  const updateState = useEvent(() => {
    const state = getStateFn(store.state);

    if (state === preState.current) return;

    // state changed, should be set to the new state
    preState.current = state;
    setState(isObserverObject(state) ? getObserverState : state);
  });

  if (Array.isArray(getStateFn(store.state))) {
    store.addKeyToUsedMap([...store.currentProxyGetKeys, 'length'].join('.'), id);
  }

  // 只在 component update 时调用，否则，会造成初始化时。渲染两次的问题
  // store变更后，重新初始化
  // 主要用于开发环境，
  // 只有开发环境下，才可能手动变更 storeName ，导致 store 变更，需要重新进行数据代理设置
  // 生产环境下，下面几个都不会变更，也就无作用
  useUpdate(updateState, [id, store]);

  useEffect(() => {
    if (!id) return;

    preState.current = getStateFn(store.state);

    const callback = () => {
      const state = getStateFn(store.state);

      updateState()

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
  }, [id, store]);

  return state;
}
