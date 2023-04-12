import { createStore } from '../src'

function initStore(storeName?: string, options?: { strictMode?: boolean }) {
  const initState = {
    type: {
      number: 123,
      string: 'string',
      boolean: true,
      symbol: Symbol(123),
      null: null as null | boolean,
      undefined: undefined as undefined | boolean,
      object: {
        name: 'object',
        author: 'pzxie',
      },
      arrayOriginal: ['1', true, 3],
      arrayReference: [{ name: 'arrayObject' }, [11, 22, 33]] as [
        { name: string },
        Array<number>,
      ],
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

describe('original type', () => {
  it('string', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const initString = initState.type.string

    state.type.string += '_1'

    expect(state.type.string).toBe(initString + '_1')
  })

  it('number', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const initData = initState.type.number

    state.type.number += 1

    expect(state.type.number).toBe(initData + 1)
  })

  it('boolean', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const initData = initState.type.boolean

    state.type.boolean = !state.type.boolean

    expect(state.type.boolean).toBe(!initData)
  })

  it('null', () => {
    const {
      store: { state },
    } = initStore()

    state.type.null = true

    expect(state.type.null).toBe(true)
  })

  it('undefined', () => {
    const {
      store: { state },
    } = initStore()

    state.type.undefined = true

    expect(state.type.undefined).toBe(true)
  })

  it('symbol', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const initData = initState.type.symbol.toString()

    state.type.symbol = Symbol(state.type.symbol.description + '_1')

    expect(state.type.symbol.toString()).toBe(
      initData.slice(0, -1) + '_1' + ')',
    )
  })
})
