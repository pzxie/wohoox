import guid from './guid'

export function isPlainObject(data) {
  const dataType = Object.prototype.toString.call(data)

  return dataType === '[object Object]'
}

export function isMap(data) {
  const dataType = Object.prototype.toString.call(data)

  return dataType === '[object WeakMap]' || dataType === '[object Map]'
}

export function isSet(data) {
  const dataType = Object.prototype.toString.call(data)

  return dataType === '[object WeakSet]' || dataType === '[object Set]'
}

export function isObserverObject(data) {
  const isArray = Array.isArray(data)

  return isArray || isPlainObject(data) || isSet(data) || isMap(data)
}

export { guid }
