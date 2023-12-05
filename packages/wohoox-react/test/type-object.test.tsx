import * as React from 'react'
import { fireEvent, cleanup, render, screen } from '@testing-library/react'
import { clearStore } from 'wohoox'

import { createStore, useStore, dispatch } from '../src'

const reactLegency = !!process.env.reactLegency

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

afterEach(() => {
  cleanup()
  clearStore()
})

describe('single component: plain object', () => {
  it('modify value', () => {
    const { initState } = initStore()

    const initData = JSON.parse(JSON.stringify(initState.type.object))
    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object.name}</span>
          <span role="symbol">{state.type.object[initSymbol]}</span>
          <button
            role="updateObjectBtn"
            onClick={() => {
              state.type.object = {
                ...state.type.object,
                name: state.type.object.name + '_object',
              }
              dispatch()
            }}
          >
            update object
          </button>
          <button
            role="updateFieldBtn"
            onClick={() => {
              state.type.object.name += '_field'
              dispatch()
            }}
          >
            update field
          </button>

          <button
            role="updateSymbolBtn"
            onClick={() => {
              state.type.object[initSymbol] += '_1'
              dispatch()
            }}
          >
            update symbol
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    const objectText = screen.getByRole('object')
    const fieldText = screen.getByRole('field')
    const symbolText = screen.getByRole('symbol')
    const updateObjectBtn = screen.getByRole('updateObjectBtn')
    const updateFieldBtn = screen.getByRole('updateFieldBtn')
    const updateSymbolBtn = screen.getByRole('updateSymbolBtn')

    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(updateObjectBtn)
    initData.name += '_object'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(updateFieldBtn)
    initData.name += '_field'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(updateFieldBtn)
    initData.name += '_field'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(updateSymbolBtn)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol_1')

    fireEvent.click(updateObjectBtn)
    initData.name += '_object'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol_1')

    fireEvent.click(updateObjectBtn)
    initData.name += '_object'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol_1')

    fireEvent.click(updateFieldBtn)
    initData.name += '_field'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol_1')
  })

  it('delete key', () => {
    const { initState } = initStore()

    const initData = JSON.parse(JSON.stringify(initState.type.object))
    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object?.name}</span>
          <span role="symbol">{state.type.object?.[initSymbol]}</span>
          <button
            role="deleteFieldBtn"
            onClick={() => {
              delete state.type.object.name
              dispatch()
            }}
          >
            delete field
          </button>
          <button
            role="deleteObjectBtn"
            onClick={() => {
              delete state.type.object
              dispatch()
            }}
          >
            delete object
          </button>
          <button
            role="deleteSymbol"
            onClick={() => {
              delete state.type.object[initSymbol]
              dispatch()
            }}
          >
            delete symbol
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    const objectText = screen.getByRole('object')
    const fieldText = screen.getByRole('field')
    const symbolText = screen.getByRole('symbol')
    const deleteFieldBtn = screen.getByRole('deleteFieldBtn')
    const deleteObjectBtn = screen.getByRole('deleteObjectBtn')
    const deleteSymbolBtn = screen.getByRole('deleteSymbol')

    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(deleteFieldBtn)
    delete initData.name
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBeFalsy()
    expect(symbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(deleteFieldBtn)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBeFalsy()
    expect(symbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(deleteSymbolBtn)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBeFalsy()
    expect(symbolText.innerHTML).toBeFalsy()

    fireEvent.click(deleteObjectBtn)
    expect(objectText.innerHTML).toBeFalsy()
    expect(fieldText.innerHTML).toBeFalsy()
    expect(symbolText.innerHTML).toBeFalsy()

    fireEvent.click(deleteObjectBtn)
    expect(objectText.innerHTML).toBeFalsy()
    expect(fieldText.innerHTML).toBeFalsy()
    expect(symbolText.innerHTML).toBeFalsy()
  })

  it('add new key', () => {
    const { initState } = initStore()
    const symbolKey = Symbol(123)

    const initData = JSON.parse(JSON.stringify(initState.type.object))
    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object.name}</span>
          <span role="symbol">{state.type.object[symbolKey]}</span>
          <button
            role="addNewKey"
            onClick={() => {
              state.type.object.newKey = 'newKey'
              dispatch()
            }}
          >
            add new key
          </button>
          <button
            role="addSymbol"
            onClick={() => {
              state.type.object[symbolKey] = 'symbol'
              dispatch()
            }}
          >
            add symbol
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    const objectText = screen.getByRole('object')
    const fieldText = screen.getByRole('field')
    const symbolText = screen.getByRole('symbol')
    const addNewKey = screen.getByRole('addNewKey')
    const addSymbol = screen.getByRole('addSymbol')

    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBeFalsy()

    fireEvent.click(addNewKey)
    initData.newKey = 'newKey'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)

    fireEvent.click(addNewKey)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)

    fireEvent.click(addSymbol)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(symbolText.innerHTML).toBe('symbol')
  })
})

describe('multi components: plain object', () => {
  it('modify value', () => {
    const { initState } = initStore()

    const initData = JSON.parse(JSON.stringify(initState.type.object))
    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object.name}</span>
          <span role="symbol">{state.type.object[initSymbol]}</span>
          <button
            role="updateObjectBtn"
            onClick={() => {
              state.type.object = {
                ...state.type.object,
                name: state.type.object.name + '_object',
              }
              dispatch()
            }}
          >
            update object
          </button>
          <button
            role="updateFieldBtn"
            onClick={() => {
              state.type.object.name += '_field'
              dispatch()
            }}
          >
            update field
          </button>
          <button
            role="updateSymbolBtn"
            onClick={() => {
              state.type.object[initSymbol] += '_1'
              dispatch()
            }}
          >
            update field
          </button>
        </div>
      )
    }

    function Siblings() {
      let name = useStore(state => state.type.object.name)
      let symbol = useStore(state => state.type.object[initSymbol])

      return (
        <div>
          <span role="siblingsText">{name}</span>
          <span role="siblingsSymbolText">{symbol}</span>
        </div>
      )
    }

    function Parent() {
      let obj = useStore(state => state.type.object)

      return (
        <div>
          <span role="parentText">{JSON.stringify(obj)}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      )
    }

    render(<Parent />, { legacyRoot: reactLegency })

    const objectText = screen.getByRole('object')
    const fieldText = screen.getByRole('field')
    const symbolText = screen.getByRole('symbol')
    const siblingsText = screen.getByRole('siblingsText')
    const siblingsSymbolText = screen.getByRole('siblingsSymbolText')
    const parentText = screen.getByRole('parentText')
    const updateObjectBtn = screen.getByRole('updateObjectBtn')
    const updateFieldBtn = screen.getByRole('updateFieldBtn')
    const updateSymbolBtn = screen.getByRole('updateSymbolBtn')

    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))

    fireEvent.click(updateObjectBtn)
    initData.name += '_object'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(updateFieldBtn)
    initData.name += '_field'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(updateFieldBtn)
    initData.name += '_field'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(updateSymbolBtn)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol_1')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol_1')

    fireEvent.click(updateObjectBtn)
    initData.name += '_object'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol_1')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol_1')

    fireEvent.click(updateObjectBtn)
    initData.name += '_object'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol_1')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol_1')

    fireEvent.click(updateFieldBtn)
    initData.name += '_field'
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol_1')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol_1')
  })
  it('delete key', () => {
    const { initState } = initStore()

    const initData = JSON.parse(JSON.stringify(initState.type.object))
    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="field">{state.type.object?.name}</span>
          <span role="symbol">{state.type.object?.[initSymbol]}</span>
          <button
            role="deleteOriginField"
            onClick={() => {
              delete state.type.object.name
              dispatch()
            }}
          >
            deleteOriginField
          </button>
          <button
            role="deleteObjectField"
            onClick={() => {
              delete state.type.object
              dispatch()
            }}
          >
            deleteObjectField
          </button>
          <button
            role="deleteSymbolField"
            onClick={() => {
              delete state.type.object[initSymbol]
              dispatch()
            }}
          >
            delete symbol
          </button>
        </div>
      )
    }

    function Siblings() {
      let name = useStore(state => state.type.object?.name)
      let symbol = useStore(state => state.type.object?.[initSymbol])

      return (
        <div>
          <span role="siblingsSymbolText">{symbol}</span>
          <span role="siblingsText">{name}</span>
        </div>
      )
    }

    function Parent() {
      let obj = useStore(state => state.type.object)

      return (
        <div>
          <span role="parentText">{JSON.stringify(obj)}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      )
    }

    render(<Parent />, { legacyRoot: reactLegency })

    const objectText = screen.getByRole('object')
    const fieldText = screen.getByRole('field')
    const symbolText = screen.getByRole('symbol')
    const siblingsText = screen.getByRole('siblingsText')
    const siblingsSymbolText = screen.getByRole('siblingsSymbolText')
    const parentText = screen.getByRole('parentText')
    const deleteOriginField = screen.getByRole('deleteOriginField')
    const deleteObjectField = screen.getByRole('deleteObjectField')
    const deleteSymbolField = screen.getByRole('deleteSymbolField')

    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBe(initData.name)
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(deleteOriginField)
    delete initData.name
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBeFalsy()
    expect(siblingsText.innerHTML).toBeFalsy()
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(deleteOriginField)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBeFalsy()
    expect(siblingsText.innerHTML).toBeFalsy()
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('initSymbol')
    expect(siblingsSymbolText.innerHTML).toBe('initSymbol')

    fireEvent.click(deleteSymbolField)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(fieldText.innerHTML).toBeFalsy()
    expect(siblingsText.innerHTML).toBeFalsy()
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBeFalsy()
    expect(siblingsSymbolText.innerHTML).toBeFalsy()

    fireEvent.click(deleteObjectField)
    expect(objectText.innerHTML).toBeFalsy()
    expect(fieldText.innerHTML).toBeFalsy()
    expect(siblingsText.innerHTML).toBeFalsy()
    expect(parentText.innerHTML).toBeFalsy()
    expect(symbolText.innerHTML).toBeFalsy()
    expect(siblingsSymbolText.innerHTML).toBeFalsy()

    fireEvent.click(deleteObjectField)
    expect(objectText.innerHTML).toBeFalsy()
    expect(fieldText.innerHTML).toBeFalsy()
    expect(siblingsText.innerHTML).toBeFalsy()
    expect(parentText.innerHTML).toBeFalsy()
    expect(symbolText.innerHTML).toBeFalsy()
    expect(siblingsSymbolText.innerHTML).toBeFalsy()
  })
  it('add new key', () => {
    const { initState } = initStore()

    const symbolKey = Symbol(123)

    const initData = JSON.parse(JSON.stringify(initState.type.object))
    const initTypeData = JSON.parse(JSON.stringify(initState.type))
    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="object">{JSON.stringify(state.type.object)}</span>
          <span role="grandpa">{JSON.stringify(state.type)}</span>
          <span role="symbol">{state.type.object[symbolKey]}</span>
          <button
            role="addNewKeyBtn"
            onClick={() => {
              state.type.object.newKey = 'newKey'
              dispatch()
            }}
          >
            add new key
          </button>
          <button
            role="addSymbolBtn"
            onClick={() => {
              state.type.object[symbolKey] = 'symbol'
              dispatch()
            }}
          >
            add symbol
          </button>
        </div>
      )
    }

    function Siblings() {
      let name = useStore(state => state.type.object.name)
      let symbol = useStore(state => state.type.object[symbolKey])

      return (
        <div>
          <span role="siblingsSymbolText">{symbol}</span>
          <span role="siblingsText">{name}</span>
        </div>
      )
    }

    function Parent() {
      let obj = useStore(state => state.type.object)

      return (
        <div>
          <span role="parentText">{JSON.stringify(obj)}</span>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      )
    }

    render(<Parent />, { legacyRoot: reactLegency })

    const objectText = screen.getByRole('object')
    const grandpaText = screen.getByRole('grandpa')
    const symbolText = screen.getByRole('symbol')
    const siblingsText = screen.getByRole('siblingsText')
    const siblingsSymbolText = screen.getByRole('siblingsSymbolText')
    const parentText = screen.getByRole('parentText')
    const addNewKeyBtn = screen.getByRole('addNewKeyBtn')
    const addSymbolBtn = screen.getByRole('addSymbolBtn')

    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(grandpaText.innerHTML).toBe(JSON.stringify(initTypeData))
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBeFalsy()
    expect(siblingsSymbolText.innerHTML).toBeFalsy()

    fireEvent.click(addNewKeyBtn)
    initData.newKey = 'newKey'
    initTypeData.object.newKey = 'newKey'
    initTypeData
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(grandpaText.innerHTML).toBe(JSON.stringify(initTypeData))
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBeFalsy()
    expect(siblingsSymbolText.innerHTML).toBeFalsy()

    fireEvent.click(addSymbolBtn)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(grandpaText.innerHTML).toBe(JSON.stringify(initTypeData))
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('symbol')
    expect(siblingsSymbolText.innerHTML).toBe('symbol')

    fireEvent.click(addNewKeyBtn)
    expect(objectText.innerHTML).toBe(JSON.stringify(initData))
    expect(grandpaText.innerHTML).toBe(JSON.stringify(initTypeData))
    expect(siblingsText.innerHTML).toBe(initData.name)
    expect(parentText.innerHTML).toBe(JSON.stringify(initData))
    expect(symbolText.innerHTML).toBe('symbol')
    expect(siblingsSymbolText.innerHTML).toBe('symbol')
  })
})
