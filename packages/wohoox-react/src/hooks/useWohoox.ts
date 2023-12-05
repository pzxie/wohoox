/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState, useEffect, useRef, useCallback } from 'react'
import { observer, ignoreToRecordEvent, DefaultStoreName } from 'wohoox'
import { isObserverObject, guid } from 'wohoox-utils'

import useEvent from './common/useEvent'
import useId from './common/useId'
import { useStore } from './useStore'

function getStringifyedList(keys: any[], sourceMap: Map<any, string>) {
  return keys
    .map(key => {
      return getStringifyedKey(key, sourceMap)
    })
    .filter(Boolean)
}

function getStringifyedKey(key: any, sourceMap: Map<any, string>) {
  if (typeof key === 'string') return key

  let keyGuid = sourceMap.get(key)

  if (!keyGuid) {
    sourceMap.set(key, (keyGuid = guid()))
  }
  return keyGuid
}

function getEffectList(
  effectMap: { add: Set<any[]>; delete: Set<any[]>; set: Set<any[]> },
  sourceMap: Map<any, string>,
) {
  const effectUpdateList = new Set<any[]>()
  const effectList = new Set<any[]>()

  effectMap.delete.forEach(keys => {
    const exist = keys.find(key => sourceMap.has(key))
    if (exist) effectUpdateList.add(keys)
    else effectList.add(keys)
  })

  effectMap.set.forEach(keys => {
    const exist = keys.find(key => sourceMap.has(key))
    if (exist) effectUpdateList.add(keys)
    else effectList.add(keys)
  })

  effectMap.add.forEach(keys => effectList.add(keys))

  return { effectUpdateList, effectList }
}

export function useWohoox(storeName?: string): any
export function useWohoox<T extends (state: any) => any>(
  getState?: T,
): ReturnType<T>
export function useWohoox<T extends (state: any) => any>(
  storeName: string,
  getState: T,
): ReturnType<T>
export function useWohoox(name?: any, getState?: any): any {
  const storeName = typeof name === 'string' ? name : DefaultStoreName

  const usedSourceMap = useRef(new Map<any, string>())
  const usedKeys = useRef(new Set<string>())
  const proxyMap = useRef(new WeakMap())

  const [, update] = useState({})
  const id = useId()
  const store = useStore(storeName)

  const getStateFn = useEvent(
    typeof name === 'function'
      ? name
      : typeof getState === 'function'
      ? getState
      : (state: any) => state,
  )

  const renderState = getStateFn(store.state)
  const basePrefixKeys =
    renderState === store.state ? [] : [...store.currentProxyGetKeys]

  const getObserverState = useEvent(() => {
    const storeOptions = store.getOptions()
    proxyMap.current = new WeakMap()

    // Use the same target with store state
    return observer(getStateFn(store.sourceState), {
      getCallback(value, keys) {
        try {
          store.currentProxyGetKeys = keys

          const stringifyKeys = getStringifyedList(keys, usedSourceMap.current)
          usedKeys.current.add(stringifyKeys.join('.'))

          if (Array.isArray(value)) {
            usedKeys.current.add([...stringifyKeys, 'length'].join('.'))
          }
        } catch (e) {
          /* empty */
        }
      },
      setCallback: () => {
        if (storeOptions.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          )
        }
      },
      addCallback: () => {
        if (storeOptions.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be modified by expression. Only actions are allowed',
          )
        }
      },
      deleteCallback: () => {
        if (storeOptions.strictMode) {
          throw new Error(
            'In the strict mode, state cannot be delete by expression. Only actions are allowed',
          )
        }
      },
      keysStack: basePrefixKeys,
      proxySetDeep: storeOptions.proxySetDeep,
      proxyMap: proxyMap.current,
      name: storeName,
    })
  })

  const preState = useRef(renderState)
  const [state, setState] = useState(getObserverState)
  const updateState = useCallback(
    (isForce?: boolean) => {
      const state = ignoreToRecordEvent('onGet', () => getStateFn(store.state))

      if (!isForce && state === preState.current) {
        return false
      }

      // State changed, should be set to a new state
      preState.current = state
      usedKeys.current.clear()
      usedSourceMap.current.clear()

      setState(isObserverObject(state) ? getObserverState() : state)

      return true
    },
    [store, state, getObserverState],
  )

  const onEveryRender = () => {
    let keys = [...basePrefixKeys]

    if (keys.find(item => typeof item !== 'string')) {
      keys = getStringifyedList(keys, usedSourceMap.current)
    }

    if (Array.isArray(renderState)) {
      keys.push('length')
      usedKeys.current.add(keys.join('.'))
    } else {
      if (basePrefixKeys.length) {
        usedKeys.current.add(keys.join('.'))
      }
    }
  }

  onEveryRender()

  // For dev environment more，
  // StoreName would not be changed normally.Unless manually changed in dev
  // or set dynamic storeName in production
  useEffect(() => {
    updateState()
  }, [id, store, updateState])

  useEffect(() => {
    store.addResetListener(updateState)

    return () => {
      store.removeResetListener(updateState)
    }
  }, [store, updateState])

  useEffect(() => {
    if (!id) return

    const callback = () => {
      // state itself changed, update
      const isUpdated = updateState()
      if (isUpdated) return

      const { effectList, effectUpdateList } = getEffectList(
        store.effectList,
        usedSourceMap.current,
      )

      // For update object, re-get state to update keys cache
      for (const keys of effectUpdateList) {
        const stringifyKeys = getStringifyedList(
          keys,
          usedSourceMap.current,
        ).join('.')

        if (usedKeys.current.has(stringifyKeys)) {
          updateState(true)
          return
        }
      }

      const state = ignoreToRecordEvent('onGet', () => getStateFn(store.state))
      // After the state sub-property is changed, it will be pushed into the effectList
      for (const keys of effectList) {
        if (
          usedKeys.current.has(
            getStringifyedList(keys, usedSourceMap.current).join('.'),
          )
        ) {
          preState.current = state
          usedKeys.current.clear()
          usedSourceMap.current.clear()
          update({})
        }
      }
    }

    store.addListener(callback)
    return () => {
      store.removeListener(callback)
    }
  }, [id, store, updateState])

  return state
}
