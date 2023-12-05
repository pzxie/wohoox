import { createStore, clearStore } from '../src'

const initSymbol = Symbol('symbol')

function initStore(storeName?: string, options?: { strictMode?: boolean }) {
  const initState = {
    type: {
      object: {
        name: 'object',
        author: 'pzxie',
        [initSymbol]: 'initSymbol',
      },
    },
  }

  const store = createStore({
    name: storeName,
    initState,
    actions: {
      dispatch() {},
    },
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

describe('plain object', () => {
  it('modify value', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const initData = JSON.parse(JSON.stringify(initState.type.object))

    function updateObject() {
      state.type.object = {
        ...state.type.object,
        name: state.type.object.name + '_object',
      }

      initData.name += '_object'

      expect(state.type.object.name).toBe(initData.name)
    }

    function updateField() {
      state.type.object.name += '_field'

      initData.name += '_field'

      expect(state.type.object.name).toBe(initData.name)
    }

    function updateSymbol() {
      state.type.object[initSymbol] += '_1'

      expect(state.type.object[initSymbol]).toBe('initSymbol_1')
    }

    updateObject()
    updateField()
    updateSymbol()
  })

  it('delete key', () => {
    const {
      store: { state },
    } = initStore()

    function deleteField() {
      // @ts-ignore
      delete state.type.object.name

      expect(state.type.object).not.toHaveProperty('name')
    }

    function deleteSymbol() {
      // @ts-ignore
      delete state.type.object[initSymbol]

      expect(state.type.object.hasOwnProperty(initSymbol)).toBeFalsy()
    }

    function deleteObject() {
      // @ts-ignore
      delete state.type.object

      expect(state.type).not.toHaveProperty('object')
    }

    deleteField()
    deleteSymbol()
    deleteObject()
  })

  it('add new key', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const symbolKey = Symbol(123)

    const initData = JSON.parse(JSON.stringify(initState.type.object))

    function addNewKey() {
      ;(state.type.object as any).newKey = 'newKey'

      initData.newKey = 'newKey'

      expect(state.type.object).toHaveProperty('newKey')
      expect((state.type.object as any).newKey).toBe(initData.newKey)
    }

    function addSymbol() {
      state.type.object[symbolKey] = 'symbol'

      initData[symbolKey] = 'symbol'

      expect(state.type.object[symbolKey]).toBe(initData[symbolKey])
    }

    addNewKey()
    addSymbol()
  })
})
