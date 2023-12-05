import { createStore, clearStore } from '../src'
import type { WohooxPlugin } from '../src'

const sourceMap = {
  string: () => Math.floor(Math.random() * 10000) + '',
  number: () => Math.floor(Math.random() * 10000),
  boolean: () => Math.random() > 0.5,
  null: () => null,
  undefined: () => undefined,
  symbol: () => Symbol('symbol' + Math.floor(Math.random() * 10000)),
  // bigint: () =>
  //   BigInt(
  //     Math.floor(Math.random() * 100000000000) +
  //       '' +
  //       Math.floor(Math.random() * 100000000000),
  //   ),
  array: () => new Array(),
  object: () => Object.assign(new Object(), { type: 'object' }),
  map: () => new Map([['type', 'map']]),
  set: () => new Set(['type']),
  weakMap: () => new WeakMap([[{ type: 'weakMap' }, 'weakMap']]),
  date: () => new Date(),
}

function getAllInitialMaps(sourceMap) {
  const typeMap = {}

  for (let key in sourceMap) {
    const map = new Map()
    for (let valueKey in sourceMap) {
      if (valueKey === key) continue
      map.set(sourceMap[key](), sourceMap[valueKey]())
    }
    typeMap[key] = map
  }

  return Object.values(typeMap).reduce((pre, current: any) => {
    ;(pre as any[]).push(...current.entries())
    return pre
  }, []) as [any, any][]
}

function initStore(
  map?: Map<any, any> | WeakMap<any, any>,
  options?: { strictMode?: boolean },
  plugins?: WohooxPlugin[],
) {
  const initState = {
    map: map || new Map(),
  }

  const store = createStore({
    initState,
    actions: {
      dispatch() {},
    },
    plugins,
    options: options || { strictMode: false },
  })

  return {
    initState,
    store,
  }
}

beforeEach(() => {
  clearStore()
})

describe('map', () => {
  describe('size', () => {
    function checkSize(initMap?: Map<any, any>) {
      const {
        store: { state },
      } = initStore(initMap)

      function add(key, value) {
        const size = (state.map as Map<any, any>).size
        state.map.set(key, value)

        expect((state.map as Map<any, any>).size).toBe(size + 1)
      }

      function deleteItem(key) {
        const size = (state.map as Map<any, any>).size
        state.map.delete(key)

        expect((state.map as Map<any, any>).size).toBe(size - 1)
      }

      function clear() {
        ;(state.map as Map<any, any>).clear()
        expect((state.map as Map<any, any>).size).toBe(0)
      }

      add(1, 1)
      add('map', 2)
      deleteItem('map')
      clear()
    }

    it('no initial', () => {
      checkSize()
    })
    it('initial 2 items', () => {
      checkSize(
        new Map([
          ['a', 3],
          ['b', 2],
        ]),
      )
    })
  })

  describe('add new item', () => {
    function checkToString(key, value) {
      const {
        store: { state },
      } = initStore()

      expect((state.map as Map<any, any>).size).toBe(0)

      state.map.set(key, value)

      expect((state.map as Map<any, any>).size).toBe(1)
      expect(state.map.get(key)).toBe(value)
    }

    it('string -> string', () => {
      checkToString('string', 'string')
    })

    it('number -> string', () => {
      checkToString(123, 'string')
    })

    it('Symbol -> string', () => {
      let key = Symbol(123)
      checkToString(key, 'string')
    })

    it('array -> string', () => {
      let key = ['array']
      let value = 'array'
      checkToString(key, value)
    })

    it('object -> string', () => {
      let key = { type: 'symbol' }
      let value = 'object'
      checkToString(key, value)
    })

    it('set -> string', () => {
      let key = new Set([1])
      let value = 'set'
      checkToString(key, value)
    })

    it('map -> string', () => {
      let key = new Map()
      let value = 'map'
      checkToString(key, value)
    })

    it('map -> object', () => {
      let currentLog: any = null
      const {
        store: { state },
      } = initStore(new Map(), { strictMode: false }, [
        {
          onChange(_storeName, value) {
            currentLog = value
          },
        },
      ])
      let key = new Map()
      let value = { type: 'map' }

      expect((state.map as Map<any, any>).size).toBe(0)

      state.map.set(key, value)
      expect((state.map as Map<any, any>).size).toBe(1)
      expect(state.map.get(key)).toMatchObject(value)

      state.map.get(key).type = 'updated'
      expect(currentLog).toBe('updated')
      expect((state.map as Map<any, any>).size).toBe(1)
      expect(state.map.get(key).type).toBe('updated')
    })

    it('map -> map', () => {
      let currentLog: any = null
      const {
        store: { state },
      } = initStore(new Map(), { strictMode: false }, [
        {
          onChange(_storeName, value) {
            currentLog = value
          },
        },
      ])
      let key = new Map()
      let value = new Map([['type', 'map']])

      expect((state.map as Map<any, any>).size).toBe(0)

      state.map.set(key, value)
      expect((state.map as Map<any, any>).size).toBe(1)
      expect(state.map.get(key).get('type')).toBe('map')

      state.map.get(key).set('type', 'updatedMap')
      expect(currentLog).toBe('updatedMap')
      expect((state.map as Map<any, any>).size).toBe(1)
      expect(state.map.get(key).get('type')).toBe('updatedMap')
    })

    it('all type', () => {
      const allMaps = getAllInitialMaps(sourceMap)

      const {
        store: { state },
      } = initStore()

      expect((state.map as Map<any, any>).size).toBe(0)

      let n = 0
      for (let [key, value] of allMaps) {
        state.map.set(key, value)

        if (typeof value === 'bigint' || typeof value === 'number') {
          expect(state.map.get(key).toString()).toBe(value.toString())
        } else
          expect(JSON.stringify(state.map.get(key))).toBe(JSON.stringify(value))
        expect((state.map as Map<any, any>).size).toBe(++n)
      }
    })
  })

  describe('edit item', () => {
    it('edit all type', () => {
      const allMaps = getAllInitialMaps(sourceMap)

      const map = new Map()

      allMaps.forEach(([key, value]) => map.set(key, value))

      let currentLog: any = null
      const {
        store: { state },
      } = initStore(map, { strictMode: false }, [
        {
          onChange(_name, value, keys) {
            if (keys[keys.length - 1] === '__size') return

            currentLog = value
          },
          onAdd(_name, value) {
            currentLog = value
          },
        },
      ])

      ;(state.map as Map<any, any>).forEach((value, key) => {
        let newValue = value

        switch (typeof value) {
          case 'bigint':
            newValue = BigInt(value.toString() + '1')
            break
          case 'boolean':
            newValue = !value
            break
          case 'number':
            newValue = value + 1
            break
          case 'string':
            newValue = value + '_1'
            break
          case 'symbol':
            newValue = Symbol(value.description + '_1')
            break
          case 'undefined':
            newValue = 'undefined_changed'
            break
          case 'object':
            if (value === null) newValue = 'null_changed'
            else if (value.toString() === '[object Map]')
              newValue.set('changed', 'changed')
            else if (value.toString() === '[object Set]')
              newValue.add('changed')
            else if (value.toString() === '[object Object]')
              newValue.changed = 'changed'
            else if (Array.isArray(value)) newValue.push('changed')
            else newValue = 'changed'
            break
        }

        if (typeof value === 'bigint' || typeof value === 'number') {
          state.map.set(key, newValue)
          expect(currentLog && currentLog.toString()).toBe(newValue.toString())
          expect(state.map.get(key).toString()).toBe(newValue.toString())
          return
        }

        if (value && value.toString() === '[object Set]') {
          expect(state.map.get(key).has('changed')).toBe(true)
          return
        }

        if (Array.isArray(value)) {
          expect(state.map.get(key).indexOf('changed') > -1).toBe(true)
          return
        }

        if (value && value.toString() === '[object Map]') {
          expect(state.map.get(key).has('changed')).toBe(true)
          expect(state.map.get(key).get('changed')).toBe('changed')
          expect(currentLog).toBe('changed')
          return
        }

        if (value && value.toString() === '[object Object]') {
          expect(state.map.get(key)).toMatchObject(newValue)
          expect(currentLog).toBe('changed')
          return
        }

        state.map.set(key, newValue)
        expect(currentLog).toBe(newValue)
        expect(state.map.get(key)).toBe(newValue)
      })
    })
  })

  describe('delete item', () => {
    it('delete item', () => {
      const {
        store: { state },
      } = initStore(
        new Map<any, any>([
          ['key', 'value'],
          [123, 123],
        ]),
      )

      expect((state.map as Map<any, any>).size).toBe(2)
      expect(state.map.get('key')).toBeTruthy()
      expect(state.map.get(123)).toBeTruthy()

      state.map.delete('key')
      expect((state.map as Map<any, any>).size).toBe(1)
      expect(state.map.get('key')).toBeFalsy()

      state.map.delete(123)
      expect((state.map as Map<any, any>).size).toBe(0)
      expect(state.map.get(123)).toBeFalsy()
    })
  })

  it('JSON.stringify', () => {
    const initState = { map: new Map() }
    const { state } = createStore({
      initState,
      options: { strictMode: false },
    })

    expect(JSON.stringify(initState.map)).toBe(JSON.stringify(state.map))

    state.map.set('name', 123)
    expect(JSON.stringify(initState.map)).toBe(JSON.stringify(state.map))
  })
})

describe('weakMap', () => {
  describe('add new item', () => {
    function checkObjToString(key, value) {
      const {
        store: { state },
      } = initStore(new WeakMap())

      expect(state.map.has(key)).toBeFalsy()
      state.map.set(key, value)
      expect(state.map.get(key)).toBe(value)
    }

    it('array -> string', () => {
      let key = ['array']
      let value = 'array'
      checkObjToString(key, value)
    })

    it('object -> string', () => {
      let key = { type: 'symbol' }
      let value = 'object'
      checkObjToString(key, value)
    })

    it('set -> string', () => {
      let key = new Set([1])
      let value = 'set'
      checkObjToString(key, value)
    })

    it('map -> string', () => {
      let key = new Map()
      let value = 'map'
      checkObjToString(key, value)
    })

    it('map -> object', () => {
      let currentLog: any = null
      const {
        store: { state },
      } = initStore(new WeakMap(), { strictMode: false }, [
        {
          onChange(_storeName, value) {
            currentLog = value
          },
        },
      ])
      let key = new Map()
      let value = { type: 'map' }

      expect(state.map.has(key)).toBeFalsy()
      state.map.set(key, value)
      expect(state.map.get(key)).toMatchObject(value)

      state.map.get(key).type = 'updated'
      expect(currentLog).toBe('updated')
      expect(state.map.get(key).type).toBe('updated')
    })

    it('map -> map', () => {
      let currentLog: any = null
      const {
        store: { state },
      } = initStore(new WeakMap(), { strictMode: false }, [
        {
          onChange(_storeName, value) {
            currentLog = value
          },
        },
      ])
      let key = new Map()
      let value = new Map([['type', 'map']])

      expect(state.map.has(key)).toBeFalsy()
      state.map.set(key, value)
      expect(state.map.get(key).get('type')).toBe('map')

      state.map.get(key).set('type', 'updatedMap')
      expect(currentLog).toBe('updatedMap')
      expect(state.map.get(key).get('type')).toBe('updatedMap')
    })
  })

  describe('edit item', () => {
    it('edit object:string', () => {
      const objectKey = {}
      let currentLog = null
      const {
        store: { state },
      } = initStore(
        new WeakMap<any, any>([[objectKey, 'value']]),
        { strictMode: false },
        [
          {
            onChange(_name, value) {
              currentLog = value
            },
          },
        ],
      )

      expect(state.map.get(objectKey)).toBe('value')
      state.map.set(objectKey, 'updated')
      expect(currentLog).toBe('updated')
      expect(state.map.get(objectKey)).toBe('updated')
    })

    it('edit set:obj', () => {
      const objectKey = {}
      let currentLog: any = null
      const {
        store: { state },
      } = initStore(
        new WeakMap<any, any>([[objectKey, { type: 'obj' }]]),
        { strictMode: false },
        [
          {
            onChange(_name, value) {
              currentLog = value
            },
          },
        ],
      )

      expect(state.map.get(objectKey).type).toBe('obj')

      state.map.set(objectKey, { type: 'newObj' })
      expect(currentLog && currentLog.type).toBe('newObj')
      expect(state.map.get(objectKey).type).toBe('newObj')

      state.map.get(objectKey).type = 'updatedByObj'
      expect(currentLog).toBe('updatedByObj')
      expect(state.map.get(objectKey).type).toBe('updatedByObj')
    })
  })

  describe('delete item', () => {
    it('delete item', () => {
      const objectKey = {}
      const setKey = new Set()
      const {
        store: { state },
      } = initStore(
        new WeakMap<any, any>([
          [objectKey, 'value'],
          [setKey, 123],
        ]),
      )

      expect(state.map.has(objectKey)).toBe(true)
      expect(state.map.has(setKey)).toBe(true)

      state.map.delete(objectKey)
      expect(state.map.has(objectKey)).toBe(false)

      state.map.delete(setKey)
      expect(state.map.has(setKey)).toBe(false)
    })
  })

  it('JSON.stringify', () => {
    const objectKey = { type: 'weakMap' }
    const initState = { map: new WeakMap([[objectKey, 123]]) }
    const { state } = createStore({
      initState,
      options: { strictMode: false },
    })

    expect(JSON.stringify(initState.map)).toBe(JSON.stringify(state.map))

    state.map.delete(objectKey)
    expect(JSON.stringify(initState.map)).toBe(JSON.stringify(state.map))
  })
})

it('same object key for multi map', () => {
  const key = { same: true }

  const { state } = createStore({
    initState: {
      map: new Map([[key, 'map']]),
      weakMap: new WeakMap([[key, 'weakMap']]),
    },
    options: { strictMode: false },
  })

  expect(state.map.has(key)).toBe(true)
  expect(state.weakMap.has(key)).toBe(true)
  ;(key as any).addKey = 'addKey'
  expect(state.map.has(key)).toBe(true)
  expect(state.weakMap.has(key)).toBe(true)

  state.map.delete(key)
  expect(state.map.has(key)).toBe(false)
  expect(state.weakMap.has(key)).toBe(true)

  state.weakMap.delete(key)
  expect(state.map.has(key)).toBe(false)
  expect(state.weakMap.has(key)).toBe(false)
})
