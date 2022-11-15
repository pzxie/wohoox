import guid from './uuid';

export function isObserverObject(data) {
  const dataType = Object.prototype.toString.call(data);

  const isArray = Array.isArray(data);

  const isPlainObject = dataType === '[object Object]';

  const isSet = dataType === '[object WeakSet]' || dataType === '[object Set]';

  const isMap = dataType === '[object WeakMap]' || dataType === '[object Map]';

  return isArray || isPlainObject || isSet || isMap;
}

export { guid };
