import { isObserverObject, isMap, isSet } from '../utils';
import { getStringifyKey } from './keyStore';
import ProxyMap from './proxyMap';
import ProxyWeakMap from './proxyWeakMap';
import ProxySet from './proxySet';
import ProxyWeakSet from './proxyWeakSet';
import { MapSetSizeKey } from '../constant';

type ObserverParams<T> = {
  source: T;
  proxyMap: WeakMap<Record<any, any> | Map<any, any> | Set<any>, any>;
  keysStack: string[];
  getCallback(value: any, keys: string[]): void;
  setCallback(value: any, keys: string[], source?: any, oldValue?: any): boolean | undefined | void;
  addCallback(value: any, keys: string[], source?: any);
  deleteCallback(target, key: string[]): void;
  proxySetDeep?: boolean;
};

function observerObject({
  source,
  proxyMap,
  keysStack,
  getCallback,
  setCallback,
  addCallback,
  deleteCallback,
  proxySetDeep,
}: ObserverParams<object>) {
  const proxy = new Proxy(source, {
    get(target, key: string, receiver) {
      let value = Reflect.get(target, key, receiver);
      const proxyValue = proxyMap.get(value);
      const keys = [...keysStack, getStringifyKey(target, key, true)];

      getCallback(value, keys);

      if (isObserverObject(value) && !proxyValue) {
        return observer(value, {
          getCallback,
          setCallback,
          addCallback,
          deleteCallback,
          keysStack: keys,
          proxyMap,
          proxySetDeep,
        });
      }

      return proxyValue || value;
    },
    set(target, key: string, value, receiver) {
      const mapKey = getStringifyKey(target, key, true);
      const keys = [...keysStack, mapKey];

      const oldValue = Reflect.get(target, key);

      if (!Reflect.has(target, key)) {
        addCallback(value, keys, target);
      } else if (value !== oldValue || (Array.isArray(target) && key === 'length')) {
        setCallback(value, keys, target, oldValue);
      }

      return Reflect.set(target, key, value, receiver);
    },
    deleteProperty(target: Record<string, any>, key: string) {
      const mapKey = getStringifyKey(target, key, true);

      const keys = [...keysStack, mapKey];
      deleteCallback(target, keys);

      return Reflect.deleteProperty(target, key);
    },
  });

  return proxy;
}

function observerMap({
  source,
  proxyMap,
  keysStack,
  getCallback,
  setCallback,
  addCallback,
  deleteCallback,
  proxySetDeep,
}: ObserverParams<Map<any, any>>) {
  const commonActions = {
    get(target, key) {
      let value = target.get(key);
      const proxyValue = proxyMap.get(value);
      const keys = [...keysStack, getStringifyKey(target, key, true)];

      getCallback(value, keys);

      if (isObserverObject(value) && !proxyValue) {
        return observer(value, {
          getCallback,
          setCallback,
          addCallback,
          deleteCallback,
          keysStack: keys,
          proxyMap,
          proxySetDeep,
        });
      }

      return proxyValue || value;
    },
    set(target, key, value) {
      const mapKey = getStringifyKey(target, key, true);
      const keys = [...keysStack, mapKey];
      const oldValue = target.get(key);

      if (!target.has(key)) {
        addCallback(value, keys, target);
      } else if (target.get(key) !== value) {
        setCallback(value, keys, target, oldValue);
      }

      return target.set(key, value);
    },

    deleteProperty(target, key) {
      const mapKey = getStringifyKey(target, key, true);
      const keys = [...keysStack, mapKey];

      deleteCallback(target, keys);

      return target.delete(key);
    },
  };

  if (source.toString() === '[object WeakMap]') return new ProxyWeakMap(source, commonActions);

  return new ProxyMap(source, {
    ...commonActions,
    clear(target) {
      // same as delete properties
      deleteCallback(target, keysStack);
      target.forEach((_, key) => {
        const stringifyKey = getStringifyKey(target, key);

        if (stringifyKey) deleteCallback(target, [...keysStack, stringifyKey]);

        target.delete(key);
      });
    },
    size(target, oldValue, newValue) {
      const keys = [...keysStack, MapSetSizeKey];
      if (oldValue === newValue) return;

      setCallback(newValue, keys, target, oldValue);
    },
  });
}

function observerSet({
  source,
  proxyMap,
  keysStack,
  getCallback,
  setCallback,
  addCallback,
  deleteCallback,
  proxySetDeep,
}: ObserverParams<Map<any, any>>) {
  const commonActions = {
    get(target, key) {
      let value = key;
      const proxyValue = proxyMap.get(value);
      const keys = [...keysStack, getStringifyKey(target, key, true)];

      getCallback(value, keys);

      if (!proxySetDeep) return value;

      if (isObserverObject(value) && !proxyValue) {
        return observer(value, {
          getCallback,
          setCallback,
          addCallback,
          deleteCallback,
          keysStack: keys,
          proxyMap,
          proxySetDeep,
        });
      }

      return proxyValue || value;
    },
    add(target, key, value) {
      const keys = [...keysStack, getStringifyKey(target, key, true)];

      if (target.has(key)) return target;

      addCallback(value, keys, target);

      return target.add(value);
    },
    deleteProperty(target, key) {
      const mapKey = getStringifyKey(target, key, true);
      const keys = [...keysStack, mapKey];

      deleteCallback(target, keys);

      return target.delete(key);
    },
  };

  if (source.toString() === '[object WeakSet]') return new ProxyWeakSet(source, commonActions);

  return new ProxySet(
    source,
    {
      ...commonActions,
      clear(target) {
        // same as delete properties
        deleteCallback(target, keysStack);
        target.forEach(value => {
          const stringifyKey = getStringifyKey(target, value);

          if (stringifyKey) deleteCallback(target, [...keysStack, stringifyKey]);

          target.delete(value);
        });
      },
      size(target, oldValue, newValue) {
        const keys = [...keysStack, MapSetSizeKey];
        if (oldValue === newValue) return;

        setCallback(newValue, keys, target, oldValue);
      },
    },
    { deep: proxySetDeep || false },
  );
}

export function observer(
  source,
  options?: {
    getCallback?(value: any, keys: string[]): void;
    setCallback?(
      value: any,
      keys: string[],
      source?: any,
      oldValue?: any,
    ): boolean | undefined | void;
    addCallback?(value: any, keys: string[], source?: any): boolean | undefined | void;
    deleteCallback?(targe, key: string[]): void;
    keysStack?: string[];
    proxyMap?: WeakMap<any, any>;
    proxySetDeep?: boolean;
  },
) {
  const {
    getCallback = () => {},
    setCallback = () => {},
    addCallback = () => {},
    deleteCallback = () => {},
    keysStack = [],
    proxyMap = new WeakMap<Record<string, any> | Map<any, any> | Set<any>>(),
    proxySetDeep = false,
  } = options || {};

  if (!isObserverObject(source)) return source;

  const proxyObj = proxyMap.get(source);
  if (proxyObj) return proxyObj;

  const proxy = (isSet(source) ? observerSet : isMap(source) ? observerMap : observerObject)({
    source,
    proxyMap,
    keysStack,
    getCallback,
    setCallback,
    addCallback,
    deleteCallback,
    proxySetDeep,
  });

  proxyMap.set(source, proxy);

  return proxy;
}
