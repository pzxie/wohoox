import { useState, useEffect, useRef } from 'react';
import useEvent from './common/useEvent';
import useId from './common/useId';
import { useStore } from './useStore';

import { observer } from '../core/observer';
import { isObserverObject, getSettleType } from '../utils';
import { defaultStoreName } from '../global';
import { EffectType } from '../constant';

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

    // Use the same target with store state
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
      setCallback: (value, keys, target) => {
        if (store.getOptions().strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        store.addKeyToEffectList(
          keys,
          value,
          getSettleType(target, [keys[keys.length - 1]], value),
        );
      },
      deleteCallback: (target, keys) => {
        if (store.getOptions().strictMode) {
          throw new Error(
            'In the strict mode, state cannot be delete by expression. Only actions are allowed',
          );
        }
        store.addKeyToEffectList(keys, target, EffectType.delete);
      },
      keysStack: state === store.state ? [] : currentPrefixKeys,
    });
  });

  const preState = useRef(getStateFn(store.state));
  const [state, setState] = useState(getObserverState);
  const updateState = useEvent(() => {
    const state = getStateFn(store.state);

    if (state === preState.current) return;

    // State changed, should be set to a new state
    preState.current = state;
    setState(isObserverObject(state) ? getObserverState : state);
  });

  if (Array.isArray(getStateFn(store.state))) {
    store.addKeyToUsedMap([...store.currentProxyGetKeys, 'length'].join('.'), id);
  } else {
    try {
      if (store.currentProxyGetKeys.length) {
        // Some property cannot be converted to strings, ex symbol. We can ignore this
        store.addKeyToUsedMap(store.currentProxyGetKeys.join('.'), id);
      }
    } catch (e) {}
  }

  // For dev environment more，
  // StoreName would not be changed normally.Unless manually changed in dev
  // or set dynamic storeName in production
  useEffect(updateState, [id, store]);

  useEffect(() => {
    if (!id) return;

    const callback = () => {
      const state = getStateFn(store.state);

      // state itself changed, update
      updateState();

      // After the state sub-property is changed, it will be pushed into the effectList
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

  useEffect(() => {
    return () => {
      // todo removeUsedId from store
    }
  }, [id, store])

  return state;
}
