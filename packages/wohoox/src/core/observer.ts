/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { isObserverObject, isMap, isSet } from 'wohoox-utils'

import { DefaultStoreName, MapSetSizeKey } from '../global'
import { isIgnoreCacheKey } from './keyCaches'
import ProxyMap from './proxyMap'
import ProxyWeakMap from './proxyWeakMap'
import ProxySet from './proxySet'
import ProxyWeakSet from './proxyWeakSet'
import { pluginsMap, isEventDisabled } from './plugin'

type ObserverParams<T> = {
  name: string
  source: T
  proxyMap: WeakMap<Record<any, any> | Map<any, any> | Set<any>, any>
  keysStack: string[]
  getCallback(value: any, keys: any[], source: any): void
  setCallback(
    value: any,
    keys: any[],
    source: any,
    oldValue: any,
  ): boolean | undefined | void
  addCallback(value: any, keys: any[], source: any)
  deleteCallback(keys: any[], target): void
  proxySetDeep?: boolean
}

function observerObject({
  name,
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
      const value = Reflect.get(target, key, receiver)

      // eslint-disable-next-line no-prototype-builtins
      if (value && !target.hasOwnProperty(key)) return value

      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]

      if (!ignore) getCallback(value, keys, target)

      const proxyValue = proxyMap.get(value)
      if (!proxyValue && isObserverObject(value)) {
        return observer(value, {
          name,
          getCallback,
          setCallback,
          addCallback,
          deleteCallback,
          keysStack: keys,
          proxyMap,
          proxySetDeep,
          isTopLevel: false,
        })
      }

      return proxyValue || value
    },
    set(target, key: string, value, receiver) {
      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]

      const oldValue = Reflect.get(target, key)
      const oldLength: number = Reflect.get(target, 'length')
      let isAddArrayItem = false

      if (!Reflect.has(target, key)) {
        addCallback(value, keys, target)
        isAddArrayItem = true
      } else if (value !== oldValue) {
        setCallback(value, keys, target, oldValue)
      }

      const result = Reflect.set(target, key, value, receiver)

      // Array length will be changed when some methods called. ex push, splice, pop
      // And it will trigger the set callback of length

      // But new array value settled by index, ex: arr[3] = 'new item'
      // It will be change the length value too, but it will not be trigger the set callback of length

      // So we call the length callback manually when new items added
      if (isAddArrayItem && Array.isArray(target) && !key.match(/\D/g)) {
        const newLength = Math.max(oldLength + 1, +key + 1)
        setCallback(newLength, [...keysStack, 'length'], target, oldLength)
        Reflect.set(target, 'length', newLength, receiver)
      }

      return result
    },
    deleteProperty(target: Record<string, any>, key: string) {
      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]
      deleteCallback(keys, target)

      return Reflect.deleteProperty(target, key)
    },
  })

  return proxy
}

function observerMap({
  name,
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
    get(target: Map<object, any>, key) {
      const value = target.get(key)
      const proxyValue = proxyMap.get(value)

      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]

      if (!ignore) getCallback(value, keys, target)

      if (isObserverObject(value) && !proxyValue) {
        return observer(value, {
          name,
          getCallback,
          setCallback,
          addCallback,
          deleteCallback,
          keysStack: keys,
          proxyMap,
          proxySetDeep,
          isTopLevel: false,
        })
      }

      return proxyValue || value
    },
    set(target: Map<object, any>, key, value) {
      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]

      const oldValue = target.get(key)

      if (!target.has(key)) {
        addCallback(value, keys, target)
      } else if (target.get(key) !== value) {
        setCallback(value, keys, target, oldValue)
      }

      return target.set(key, value)
    },

    deleteProperty(target: Map<object, any>, key) {
      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]

      deleteCallback(keys, target)

      return target.delete(key)
    },
  }

  if (source.toString() === '[object WeakMap]')
    return new ProxyWeakMap(source, commonActions)

  return new ProxyMap(source, {
    ...commonActions,
    clear(target) {
      // same as delete properties
      deleteCallback(keysStack, target)
      target.forEach((_, key) => {
        const ignore = isIgnoreCacheKey(key)

        if (!ignore) deleteCallback([...keysStack, key], target)

        target.delete(key)
      })
    },
    size(target, oldValue, newValue) {
      const keys = [...keysStack, MapSetSizeKey]
      if (oldValue === newValue) return

      setCallback(newValue, keys, target, oldValue)
    },
  })
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
  name,
}: ObserverParams<Map<any, any>>) {
  const commonActions = {
    get(target, key) {
      const value = key
      const proxyValue = proxyMap.get(value)

      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]

      if (!ignore) getCallback(value, keys, target)

      if (!proxySetDeep) return value

      if (isObserverObject(value) && !proxyValue) {
        return observer(value, {
          name,
          getCallback,
          setCallback,
          addCallback,
          deleteCallback,
          keysStack: keys,
          proxyMap,
          proxySetDeep,
          isTopLevel: false,
        })
      }

      return proxyValue || value
    },
    add(target: Set<any>, key, value) {
      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]

      if (target.has(key)) return target

      addCallback(value, keys, target)

      return target.add(value)
    },
    deleteProperty(target: Set<any>, key) {
      const ignore = isIgnoreCacheKey(key)
      const keys = ignore ? keysStack : [...keysStack, key]

      deleteCallback(keys, target)

      return target.delete(key)
    },
  }

  if (source.toString() === '[object WeakSet]')
    return new ProxyWeakSet(source, commonActions)

  return new ProxySet(
    source,
    {
      ...commonActions,
      clear(target: Set<any>) {
        // same as delete properties
        deleteCallback(keysStack, target)
        target.forEach(value => {
          const ignore = isIgnoreCacheKey(value)

          if (!ignore) deleteCallback([...keysStack, value], target)

          target.delete(value)
        })
      },
      size(target, oldValue, newValue) {
        const keys = [...keysStack, MapSetSizeKey]
        if (oldValue === newValue) return

        setCallback(newValue, keys, target, oldValue)
      },
    },
    { deep: proxySetDeep || false },
  )
}

export function observer(
  source,
  options?: Omit<Partial<ObserverParams<any>>, 'source'> & {
    name: string
    isTopLevel?: boolean
  },
) {
  const {
    keysStack = [],
    proxyMap = new WeakMap(),
    proxySetDeep = true,
    name = DefaultStoreName,
    isTopLevel = true,
  } = options || {}

  const getCallback: ObserverParams<any>['getCallback'] = (...args) => {
    options?.getCallback?.(...args)
    if (isTopLevel && !isEventDisabled('onGet'))
      pluginsMap.get(name)?.forEach(plugin => plugin.onGet?.(name, ...args))
  }
  const setCallback: ObserverParams<any>['setCallback'] = (...args) => {
    options?.setCallback?.(...args)
    if (isTopLevel && !isEventDisabled('onChange'))
      pluginsMap.get(name)?.forEach(plugin => plugin.onChange?.(name, ...args))
  }
  const addCallback: ObserverParams<any>['addCallback'] = (...args) => {
    options?.addCallback?.(...args)
    if (isTopLevel && !isEventDisabled('onAdd'))
      pluginsMap.get(name)?.forEach(plugin => plugin.onAdd?.(name, ...args))
  }
  const deleteCallback: ObserverParams<any>['deleteCallback'] = (...args) => {
    options?.deleteCallback?.(...args)
    if (isTopLevel && !isEventDisabled('onDelete'))
      pluginsMap.get(name)?.forEach(plugin => plugin.onDelete?.(name, ...args))
  }

  if (!isObserverObject(source)) return source

  const proxyObj = proxyMap.get(source)
  if (proxyObj) return proxyObj

  const proxy = (
    isSet(source) ? observerSet : isMap(source) ? observerMap : observerObject
  )({
    name,
    source,
    proxyMap,
    keysStack,
    getCallback,
    setCallback,
    addCallback,
    deleteCallback,
    proxySetDeep,
  })

  proxyMap.set(source, proxy)

  return proxy
}
