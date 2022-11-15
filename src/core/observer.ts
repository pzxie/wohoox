import { isObserverObject } from '../utils';

export function observer<T extends Record<string, any>>(
  source: T,
  options?: {
    getCallback?(value: any, keys: (string | number | symbol | Symbol)[]): void;
    setCallback?(
      value: any,
      keys: (string | number | symbol | Symbol)[],
    ): boolean | undefined | void;
    deleteCallback?(targe, key): void;
    keysStack?: (string | number | symbol | Symbol)[];
    proxyMap?: WeakMap<any, any>;
  },
) {
  const {
    getCallback = () => {},
    setCallback = () => {},
    deleteCallback = () => {},
    keysStack = [],
    proxyMap = new WeakMap(),
  } = options || {};

  if (!isObserverObject(source)) return source;

  const proxyObj = proxyMap.get(source);
  if (proxyObj) return proxyObj;

  const proxy: T = new Proxy(source, {
    get(target, key, receiver) {
      let value = Reflect.get(target, key, receiver);
      const proxyValue = proxyMap.get(value);
      const keys = [...keysStack, key];

      if (
        typeof value === 'function' &&
        (Object.prototype.toString.call(target) === '[object Set]' ||
          Object.prototype.toString.call(target) === '[object Map]' ||
          Object.prototype.toString.call(target) === '[object WeakSet]' ||
          Object.prototype.toString.call(target) === '[object WeakMap]')
      ) {
        value = value.bind(target);
      }

      getCallback(value, keys);

      if (isObserverObject(value) && !proxyValue) {
        return observer(value, {
          getCallback,
          setCallback,
          deleteCallback,
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
    deleteProperty(target: Record<string | symbol, any>, key) {
      delete target[key];

      const keys = [...keysStack, key];
      deleteCallback(target, keys);

      return true;
    },
  });

  proxyMap.set(source, proxy);

  return proxy;
}
