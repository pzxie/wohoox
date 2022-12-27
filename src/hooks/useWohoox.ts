import { useState, useEffect, useRef, useCallback } from 'react';
import useEvent from './common/useEvent';
import useId from './common/useId';
import { useStore } from './useStore';

import { observer } from '../core/observer';
import {
  tagAsUsedStringifyKeys,
  removeAsUnusedStringifyKeys,
} from '../core/keyStore';
import { isObserverObject } from '../utils';
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

  const usedKeys = useRef(new Set<string>());
  const proxyMap = useRef(new WeakMap());

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
    const storeOptions = store.getOptions();
    proxyMap.current = new WeakMap();

    // Use the same target with store state
    return observer(getStateFn(store.sourceState), {
      getCallback(value, keys) {
        try {
          store.currentProxyGetKeys = keys;
          const key = keys.join('.');

          usedKeys.current.add(key);

          if (Array.isArray(value)) {
            usedKeys.current.add([...keys, 'length'].join('.'));
          }
        } catch (e) {}
      },
      setCallback: (value, keys, target) => {
        if (storeOptions.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        store.addKeyToEffectList(keys, value, EffectType.modify);
      },
      addCallback: (value, keys, target) => {
        if (storeOptions.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          );
        }

        store.addKeyToEffectList(keys, value, EffectType.add);
      },
      deleteCallback: (target, keys) => {
        if (storeOptions.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be delete by expression. Only actions are allowed',
          );
        }
        store.addKeyToEffectList(keys, target, EffectType.delete);
      },
      keysStack: state === store.state ? [] : currentPrefixKeys,
      proxySetDeep: storeOptions.proxySetDeep,
      proxyMap: proxyMap.current
    });
  });

  const preState = useRef(getStateFn(store.state));
  const [state, setState] = useState(getObserverState);
  const updateState = useCallback((isForce?: boolean) => {
    const state = getStateFn(store.state);

    if (!isForce && state === preState.current) {
      return false;
    }

    // State changed, should be set to a new state
    preState.current = state;
    usedKeys.current.clear();
    removeAsUnusedStringifyKeys(id);
    
    setState(isObserverObject(state) ? getObserverState() : state);

    return true;
  }, [store, state, getObserverState]);

  const onEveryRender = () => {
    const tempState = getStateFn(store.state);
    const keys = store.currentProxyGetKeys;

    if (Array.isArray(tempState)) {
      usedKeys.current.add([...keys, 'length'].join('.'));
    } else {
      try {
        if (keys.length) {
          // Some property cannot be converted to strings, ex symbol. We can ignore this
          usedKeys.current.add(keys.join('.'));
        }
      } catch (e) {}
    }
  };

  onEveryRender();

  // For dev environment more，
  // StoreName would not be changed normally.Unless manually changed in dev
  // or set dynamic storeName in production
  useEffect(() => {
    updateState();
  }, [id, store, updateState]);

  useEffect(() => {
    if (!id) return;

    const callback = () => {
      // state itself changed, update
      const isUpdated = updateState();
      if (isUpdated) return;

      const state = getStateFn(store.state);

      // For update object, re-get state to update keys cache
      for (let key of store.effectUpdateList) {
        if (usedKeys.current.has(key)) { 
          updateState(true);
          return;
        }
      }

      // After the state sub-property is changed, it will be pushed into the effectList
      for (let key of store.effectList) {
        if (usedKeys.current.has(key)) {
          preState.current = state;
          usedKeys.current.clear();
          update({});
        }
      }
    };

    store.addListener(callback);
    return () => {
      store.removeListener(callback);
    };
  }, [id, store, updateState]);

  useEffect(() => {
    tagAsUsedStringifyKeys(id, [...usedKeys.current]);
  });

  useEffect(() => {
    return () => {
      removeAsUnusedStringifyKeys(id);
    };
  }, []);

  return state;
}
