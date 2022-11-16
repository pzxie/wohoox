import { isObserverObject, isMap, isSet } from '../utils';

function observerObject({ source, proxyMap, keysStack, getCallback, setCallback, deleteCallback }) {
  const proxy = new Proxy(source, {
    get(target, key: string, receiver) {
      let value = Reflect.get(target, key, receiver);
      const proxyValue = proxyMap.get(value);
      const keys = [...keysStack, key];

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
    set(target, key: string, value, receiver) {
      const keys = [...keysStack, key];
      setCallback(value, keys, target);

      return Reflect.set(target, key, value, receiver);
    },
    deleteProperty(target: Record<string, any>, key: string) {
      const keys = [...keysStack, key];
      deleteCallback(target, keys);

      delete target[key];
      return true;
    },
  });

  return proxy;
}

function observerMap({ source, proxyMap, keysStack, getCallback, setCallback, deleteCallback }) {

  // if (
  //   typeof value === 'function' &&
  //   (Object.prototype.toString.call(target) === '[object Set]' ||
  //     Object.prototype.toString.call(target) === '[object Map]' ||
  //     Object.prototype.toString.call(target) === '[object WeakSet]' ||
  //     Object.prototype.toString.call(target) === '[object WeakMap]')
  // ) {
  //   value = value.bind(target);
  // }

  return source
}

function observerSet({ source, proxyMap, keysStack, getCallback, setCallback, deleteCallback }) {  return source}

export function observer<T extends Record<string, any>>(
  source: T,
  options?: {
    getCallback?(value: any, keys: string[]): void;
    setCallback?(
      value: any,
      keys: string[],
      source?: any
    ): boolean | undefined | void;
    deleteCallback?(targe, key: string[]): void;
    keysStack?: string[];
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

  const proxy: T = (isSet(source) ? observerSet : isMap(source) ? observerMap : observerObject)({
    source,
    proxyMap,
    keysStack,
    getCallback,
    setCallback,
    deleteCallback,
  });

  proxyMap.set(source, proxy);

  return proxy;
}
