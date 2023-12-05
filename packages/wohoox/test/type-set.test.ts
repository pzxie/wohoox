import { createStore, clearStore } from '../src'
import type { WohooxPlugin } from '../src'

const sourceMap = {
  string: () => Math.floor(Math.random() * 10000) + '',
  number: () => Math.floor(Math.random() * 10000),
  boolean: () => Math.random() > 0.5,
  null: () => null,
  undefined: () => undefined,
  symbol: () => Symbol('symbol' + Math.floor(Math.random() * 10000)),
  bigint: () =>
    BigInt(
      Math.floor(Math.random() * 100000000000) +
        '' +
        Math.floor(Math.random() * 100000000000),
    ),
  array: () => new Array(),
  object: () => Object.assign(new Object(), { type: 'object' }),
  map: () => new Map([['type', 'map']]),
  set: () => new Set(['type']),
  weakMap: () => new WeakMap([[{ type: 'weakMap' }, 'weakMap']]),
  date: () => new Date(),
}

function getAllInitialMaps(sourceMap) {
  const set = new Set()

  for (let key in sourceMap) {
    set.add(sourceMap[key]())
  }

  return [...set]
}

function initStore(
  set?: Set<any> | WeakSet<any>,
  options?: { strictMode?: boolean; proxySetDeep?: boolean },
  plugins?: WohooxPlugin[],
) {
  const initState = {
    set: set || new Set(),
  }

  const store = createStore({
    initState,
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

describe('set', () => {
  describe('size', () => {
    function checkSize(initSet?: Set<any>) {
      const {
        store: { state },
      } = initStore(initSet)

      function add() {
        const size = (state.set as Set<any>).size
        const number = Math.floor(Math.random() * 1000000000)
        state.set.add(number)

        expect(state.set.has(number)).toBeTruthy()
        expect((state.set as Set<any>).size).toBe(size + 1)
      }

      function addString() {
        const size = (state.set as Set<any>).size
        state.set.add('map')

        expect(state.set.has('map')).toBeTruthy()
        expect((state.set as Set<any>).size).toBe(size + 1)
      }

      function deleteString() {
        const size = (state.set as Set<any>).size
        state.set.delete('map')

        expect(state.set.has('map')).toBeFalsy()
        expect((state.set as Set<any>).size).toBe(size - 1)
      }

      function clear() {
        ;(state.set as Set<any>).clear()

        expect((state.set as Set<any>).size).toBe(0)
      }

      expect((state.set as Set<any>).size).toBe(initSet?.size || 0)

      add()
      addString()
      deleteString()
      clear()
    }

    it('no initial', () => {
      checkSize()
    })
    it('initial 2 items', () => {
      checkSize(new Set(['a', 'b']))
    })
  })

  describe('add new item', () => {
    it('all type', () => {
      const allMaps = getAllInitialMaps(sourceMap)

      const {
        store: { state },
      } = initStore()

      function add(item) {
        const size = (state.set as Set<any>).size

        state.set.add(item)

        expect((state.set as Set<any>).size).toBe(size + 1)
        expect(state.set.has(item)).toBe(true)
      }

      const originAllMaps = [...allMaps]
      for (let item of originAllMaps) {
        add(item)
      }
    })
  })

  describe('delete item', () => {
    it('delete item', () => {
      const all = [...getAllInitialMaps(sourceMap)]

      const {
        store: { state },
      } = initStore(new Set<any>(all))

      function deleteItem(item) {
        const size = (state.set as Set<any>).size
        state.set.delete(item)

        expect((state.set as Set<any>).size).toBe(size - 1)
        expect(state.set.has(item)).toBeFalsy()
      }

      const total = all.length

      expect((state.set as Set<any>).size).toBe(total)

      for (let item of all) {
        deleteItem(item)
      }
    })
  })

  describe('edit item', () => {
    it('proxySetDeep: true', () => {
      const obj = { type: 'edit' }
      let logValue = null

      const {
        store: { state },
      } = initStore(
        new Set<any>([obj]),
        { proxySetDeep: true, strictMode: false },
        [
          {
            onChange(_storeName, value) {
              logValue = value
            },
          },
        ],
      )

      const [tempObj] = [...(state.set as Set<any>)]

      expect(tempObj.type).toBe('edit')

      tempObj.type = 'editChanged'

      expect(logValue).toBe('editChanged')
      expect(tempObj.type).toBe('editChanged')
    })
    it('proxySetDeep: false', () => {
      const obj = { type: 'edit' }
      let logValue = null

      const {
        store: { state },
      } = initStore(new Set<any>([obj]), { proxySetDeep: false }, [
        {
          onChange(_storeName, value) {
            logValue = value
          },
        },
      ])

      const [tempObj] = [...(state.set as Set<any>)]

      expect(tempObj.type).toBe('edit')

      tempObj.type = 'editChanged'

      expect(logValue).toBe(null)
      expect(tempObj.type).toBe('editChanged')
    })
  })

  it('JSON.stringify', () => {
    const initState = { set: new Set() }
    const { state } = createStore({
      initState,
      options: { strictMode: false },
    })

    expect(JSON.stringify(initState.set)).toBe(JSON.stringify(state.set))

    state.set.add('set')
    expect(JSON.stringify(initState.set)).toBe(JSON.stringify(state.set))
  })
})

describe('weakSet', () => {
  describe('add new item', () => {
    function checkObjToString(value) {
      const {
        store: { state },
      } = initStore(new WeakSet())

      expect(state.set.has(value)).toBeFalsy()

      state.set.add(value)

      expect(state.set.has(value)).toBe(true)
    }

    it('array', () => {
      let key = ['array']
      checkObjToString(key)
    })

    it('object', () => {
      let key = { type: 'symbol' }
      checkObjToString(key)
    })

    it('set', () => {
      let key = new Set([1])
      checkObjToString(key)
    })

    it('map', () => {
      let key = new Map()
      checkObjToString(key)
    })
  })

  describe('delete item', () => {
    it('delete item', () => {
      const objectKey = {}
      const setKey = new Set()
      const {
        store: { state },
      } = initStore(new WeakSet<any>([objectKey, setKey]))

      expect(state.set.has(objectKey)).toBe(true)
      expect(state.set.has(setKey)).toBe(true)

      state.set.delete(objectKey)
      expect(state.set.has(objectKey)).toBe(false)

      state.set.delete(setKey)
      expect(state.set.has(setKey)).toBe(false)
    })
  })

  it('JSON.stringify', () => {
    const objectKey = { type: 'weakSet' }
    const initState = { set: new WeakSet([objectKey]) }
    const { state } = createStore({
      initState,
      options: { strictMode: false },
    })

    expect(JSON.stringify(initState.set)).toBe(JSON.stringify(state.set))

    state.set.delete(objectKey)
    expect(JSON.stringify(initState.set)).toBe(JSON.stringify(state.set))
  })
})

it('same object key for multi map', () => {
  const key = { same: true }

  const { state } = createStore({
    initState: {
      set: new Set([key]),
      weakSet: new WeakSet([key]),
    },
    options: { strictMode: false },
  })

  expect(state.set.has(key)).toBe(true)
  expect(state.weakSet.has(key)).toBe(true)
  ;(key as any).addKey = 'addKey'

  expect(state.set.has(key)).toBe(true)
  expect(state.weakSet.has(key)).toBe(true)

  state.set.delete(key)
  expect(state.set.has(key)).toBe(false)
  expect(state.weakSet.has(key)).toBe(true)

  state.weakSet.delete(key)
  expect(state.set.has(key)).toBe(false)
  expect(state.weakSet.has(key)).toBe(false)
})

describe('proxySetDeep', () => {
  const objectKey = {}

  it('true', () => {
    const obj = { name: 'obj' }
    const arr = [1, 2]
    const map = new Map()
    const weakMap = new WeakMap<any, any>([[obj, 123]])
    const originSet = new Set()
    const weakSet = new WeakSet()

    let currentLog: any = []

    const {
      store: { state },
    } = initStore(
      new Set<any>([obj, arr, map, weakMap, originSet, weakSet]),
      {
        strictMode: false,
        proxySetDeep: true,
      },
      [
        {
          onAdd(_storeName, value, keys) {
            currentLog = [value, keys]
          },
        },
      ],
    )

    function objEdit() {
      currentLog = null
      const objTemp = [...(state.set as Set<any>).values()][0]
      const value = 'objChanged'
      objTemp.changed = value

      expect((obj as any).changed).toBe(value)
      expect(currentLog && currentLog[0]).toBe(value)
    }

    function arrayEdit() {
      currentLog = null
      const arrayTemp = [...(state.set as Set<any>).values()][1]
      const value = 'arrayChanged'
      arrayTemp.push(value)

      expect(arr[arr.length - 1]).toBe(value)
      expect(currentLog && currentLog[0]).toBe(value)
    }

    function mapEdit() {
      currentLog = null
      const mapTemp = [...(state.set as Set<any>).values()][2]
      const value = 'mapChanged'
      mapTemp.set('changed', value)

      expect(map.get('changed')).toBe(value)
      expect(currentLog && currentLog[0]).toBe(value)
    }

    function weakMapEdit() {
      currentLog = null
      const weakMapTemp = [...(state.set as Set<any>).values()][3]
      const value = 'weakMapChanged'
      weakMapTemp.set(objectKey, value)

      expect(weakMap.get(objectKey)).toBe(value)
      expect(currentLog && currentLog[0]).toBe(value)
    }

    function setEdit() {
      currentLog = null
      const setTemp = [...(state.set as Set<any>).values()][4]
      const value = 'setChanged'
      setTemp.add(value)

      expect(originSet.has(value)).toBe(true)
      expect(currentLog && currentLog[0]).toBe(value)
    }

    function weakSetEdit() {
      currentLog = null
      const weakSetTemp = [...(state.set as Set<any>).values()][5]
      weakSetTemp.add(objectKey)

      expect(weakSet.has(objectKey)).toBe(true)
      expect(currentLog && currentLog[0]).toBe(objectKey)
    }

    objEdit()
    arrayEdit()
    mapEdit()
    weakMapEdit()
    setEdit()
    weakSetEdit()
  })

  it('false', () => {
    const obj = { name: 'obj' }
    const arr = [1, 2]
    const map = new Map()
    const weakMap = new WeakMap<any, any>([[obj, 123]])
    const originSet = new Set()
    const weakSet = new WeakSet()

    let currentLog: any = null

    const {
      store: { state },
    } = initStore(
      new Set<any>([obj, arr, map, weakMap, originSet, weakSet]),
      {
        strictMode: false,
        proxySetDeep: false,
      },
      [
        {
          onAdd(_storeName, value, keys) {
            currentLog = [value, keys]
          },
        },
      ],
    )

    function objEdit() {
      currentLog = null
      const objTemp = [...(state.set as Set<any>).values()][0]
      const value = 'objChanged'
      objTemp.changed = value

      expect((obj as any).changed).toBe(value)
      expect(currentLog).toBe(null)
    }

    function arrayEdit() {
      currentLog = null
      const arrayTemp = [...(state.set as Set<any>).values()][1]
      const value = 'arrayChanged'
      arrayTemp.push(value)

      expect(arr[arr.length - 1]).toBe(value)
      expect(currentLog).toBe(null)
    }

    function mapEdit() {
      currentLog = null
      const mapTemp = [...(state.set as Set<any>).values()][2]
      const value = 'mapChanged'
      mapTemp.set('changed', value)

      expect(map.get('changed')).toBe(value)
      expect(currentLog).toBe(null)
    }

    function weakMapEdit() {
      currentLog = null
      const weakMapTemp = [...(state.set as Set<any>).values()][3]
      const value = 'weakMapChanged'
      weakMapTemp.set(objectKey, value)

      expect(weakMap.get(objectKey)).toBe(value)
      expect(currentLog).toBe(null)
    }

    function setEdit() {
      currentLog = null
      const setTemp = [...(state.set as Set<any>).values()][4]
      const value = 'setChanged'
      setTemp.add(value)

      expect(originSet.has(value)).toBe(true)
      expect(currentLog).toBe(null)
    }

    function weakSetEdit() {
      currentLog = null
      const weakSetTemp = [...(state.set as Set<any>).values()][5]
      weakSetTemp.add(objectKey)

      expect(weakSet.has(objectKey)).toBe(true)
      expect(currentLog).toBe(null)
    }

    objEdit()
    arrayEdit()
    mapEdit()
    weakMapEdit()
    setEdit()
    weakSetEdit()
  })
})
