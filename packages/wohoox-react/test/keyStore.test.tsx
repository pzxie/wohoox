import * as React from 'react'
import { fireEvent, cleanup, render, screen } from '@testing-library/react'

import createStore, { useStore, dispatch } from '../src'

import { keyCaches_SourceMap, keyCaches_StringifiedKeySourceMap } from 'wohoox'

const reactLegency = !!process.env.reactLegency

function initStore(data: any, options?: { strictMode?: boolean }) {
  const initState = {
    data,
  }

  const store = createStore({
    initState,
    options: options || { strictMode: false, proxySetDeep: true },
  })

  return {
    initState,
    store,
  }
}

beforeEach(cleanup)

describe('keyStore cache: single component', () => {
  function checkOriginType(existValue, updateValue, addValue) {
    initStore(existValue)

    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="string">{state.data + ''}</span>
          <span role="string_add">{state.addData + ''}</span>

          <button
            role="add"
            onClick={() => {
              state.addData = addValue
              dispatch()
            }}
          >
            add
          </button>
          <button
            role="delete"
            onClick={() => {
              delete state.addData
              dispatch()
            }}
          >
            delete
          </button>
          <button
            role="update"
            onClick={() => {
              state.data = updateValue
              dispatch()
            }}
          >
            update
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(keyCaches_StringifiedKeySourceMap.size).toBe(0)
    expect(keyCaches_SourceMap.size).toBe(0)
    expect(screen.getByRole('string').innerHTML).toBe(existValue + '')
    expect(screen.getByRole('string_add').innerHTML).toBe('undefined')

    fireEvent.click(screen.getByRole('update'))
    expect(screen.getByRole('string').innerHTML).toBe(updateValue + '')
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(0)
    expect(keyCaches_SourceMap.size).toBe(0)

    fireEvent.click(screen.getByRole('add'))
    expect(screen.getByRole('string').innerHTML).toBe(updateValue + '')
    expect(screen.getByRole('string_add').innerHTML).toBe(addValue + '')
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(0)
    expect(keyCaches_SourceMap.size).toBe(0)

    fireEvent.click(screen.getByRole('delete'))
    expect(screen.getByRole('string').innerHTML).toBe(updateValue + '')
    expect(screen.getByRole('string_add').innerHTML).toBe('undefined')
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(0)
    expect(keyCaches_SourceMap.size).toBe(0)
  }

  it('string', () => {
    checkOriginType('123', '1234', 'newVal')
  })

  it('number', () => {
    checkOriginType(123, 1234, 1000)
  })

  it('boolean', () => {
    checkOriginType(false, true, true)
  })

  it('null', () => {
    checkOriginType(null, 123, null)
  })

  it('undefined', () => {
    checkOriginType(undefined, 123, undefined)
  })

  it('date', () => {
    checkOriginType(
      new Date(),
      new Date(Date.now() + 1000000),
      new Date(Date.now() + 10000),
    )
  })

  it('object', () => {
    const existSymbol = Symbol('exist')
    initStore({
      typeOrigin: 'init',
      typeRef: { type: 'ref' },
      [existSymbol]: 'existSymbolValue',
    })

    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="string">{JSON.stringify(state.data)}</span>
          <span role="string_add">{state.data[existSymbol]}</span>

          <button
            role="add"
            onClick={() => {
              state.data.addData = 'add'
              state.data[Symbol('new symbol')] = 'new symbol'
              dispatch()
            }}
          >
            add
          </button>
          <button
            role="delete"
            onClick={() => {
              delete state.data.addData
              delete state.data[existSymbol]
              dispatch()
            }}
          >
            delete
          </button>
          <button
            role="update"
            onClick={() => {
              state.data.typeOrigin = 'update'
              state.data[existSymbol] = '222'
              dispatch()
            }}
          >
            update
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    let currentStringifiedKeySourceMapSize = 1
    let currentSourceMapSize = 2

    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').innerHTML).toContain('init')
    expect(screen.getByRole('string_add').innerHTML).toBe('existSymbolValue')

    fireEvent.click(screen.getByRole('update'))
    expect(keyCaches_StringifiedKeySourceMap.size).toBeGreaterThanOrEqual(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBeGreaterThanOrEqual(
      currentSourceMapSize,
    )
    expect(screen.getByRole('string').innerHTML).toContain('update')
    expect(screen.getByRole('string_add').innerHTML).toBe('222')
    currentStringifiedKeySourceMapSize = keyCaches_StringifiedKeySourceMap.size
    currentSourceMapSize = keyCaches_SourceMap.size

    fireEvent.click(screen.getByRole('add'))
    expect(keyCaches_StringifiedKeySourceMap.size).toBeGreaterThanOrEqual(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBeGreaterThanOrEqual(
      currentSourceMapSize,
    )
    expect(screen.getByRole('string').innerHTML).toContain('add')
    expect(screen.getByRole('string_add').innerHTML).toBe('222')
    currentStringifiedKeySourceMapSize = keyCaches_StringifiedKeySourceMap.size
    currentSourceMapSize = keyCaches_SourceMap.size

    fireEvent.click(screen.getByRole('delete'))
    expect(keyCaches_StringifiedKeySourceMap.size).toBeLessThanOrEqual(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBeLessThanOrEqual(currentSourceMapSize)
    expect(screen.getByRole('string').innerHTML).not.toContain('add')
    expect(screen.getByRole('string_add').innerHTML).toBe('')
  })

  it('array', () => {
    initStore([2, 6, 3, 1])

    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="string">
            {state.data.map(item => (
              <span key={Math.random()}>{JSON.stringify(item)}</span>
            ))}
          </span>

          <button
            role="add"
            onClick={() => {
              state.data.push({ type: 'addObject' })
              state.data.push('addOrigin')
              dispatch()
            }}
          >
            add
          </button>
          <button
            role="deleteAfterObjectIndexChanged"
            onClick={() => {
              state.data.splice(0, 1)
              dispatch()
            }}
          >
            deleteAfterObjectIndexChanged
          </button>
          <button
            role="deleteAfterObjectIndexNotChange"
            onClick={() => {
              state.data.splice(-1, 1)
              dispatch()
            }}
          >
            deleteAfterObjectIndexNotChange
          </button>
          <button
            role="rewriteArray"
            onClick={() => {
              state.data = [...state.data]
              dispatch()
            }}
          >
            deleteObject
          </button>
          <button
            role="update"
            onClick={() => {
              state.data[0] = 'update'
              dispatch()
            }}
          >
            update
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    let currentStringifiedKeySourceMapSize = 0
    let currentSourceMapSize = 0

    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(4)

    fireEvent.click(screen.getByRole('update'))
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(4)
    expect(screen.getByRole('string').innerHTML).toContain('update')

    fireEvent.click(screen.getByRole('add'))
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(6)
    expect(screen.getByRole('string').innerHTML).toContain('addObject')
    expect(screen.getByRole('string').innerHTML).toContain('addOrigin')

    fireEvent.click(screen.getByRole('deleteAfterObjectIndexNotChange'))
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(5)
    expect(screen.getByRole('string').innerHTML).not.toContain('addOrigin')

    fireEvent.click(screen.getByRole('deleteAfterObjectIndexChanged'))
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(4)
    expect(screen.getByRole('string').innerHTML).not.toContain('2')
    currentStringifiedKeySourceMapSize = keyCaches_StringifiedKeySourceMap.size
    currentSourceMapSize = keyCaches_SourceMap.size

    fireEvent.click(screen.getByRole('rewriteArray'))
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(4)
  })

  it('set', () => {
    const obj = { type: 'set' }
    const symbol = Symbol('symbolKey')

    initStore(new Set([obj, 2, '44', symbol]))

    function Child() {
      let state = useStore()

      const data = [...state.data]
      return (
        <div>
          <span role="string">
            {data.map(item => (
              <span key={Math.random()}>{JSON.stringify(item)}</span>
            ))}
          </span>
          <span>{state.data.size}</span>

          <button
            role="add"
            onClick={() => {
              state.data.add({ type: 'addObject' })
              state.data.add('addOrigin')
              dispatch()
            }}
          >
            add
          </button>
          <button
            role="delete"
            onClick={() => {
              state.data.delete(obj)
              dispatch()
            }}
          >
            delete
          </button>
          <button
            role="clear"
            onClick={() => {
              state.data.clear()
              dispatch()
            }}
          >
            clear
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    let currentStringifiedKeySourceMapSize = 3
    let currentSourceMapSize = 4

    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(4)

    fireEvent.click(screen.getByRole('add'))
    currentStringifiedKeySourceMapSize = 4
    currentSourceMapSize = 5
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(6)

    fireEvent.click(screen.getByRole('delete'))
    currentStringifiedKeySourceMapSize = 3
    currentSourceMapSize = 4
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(5)

    fireEvent.click(screen.getByRole('clear'))
    currentStringifiedKeySourceMapSize = 0
    currentSourceMapSize = 0
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(0)
  })

  it('map', () => {
    const obj = { type: 'map' }
    const symbol = Symbol('symbolKey')

    initStore(
      new Map<any, any>([
        ['name', 'string_xpz'],
        [obj, 'obj_string'],
        [1, 'number_string'],
        [symbol, { type: 'symbol_obj' }],
      ]),
    )

    function Child() {
      let state = useStore()

      const data = [...state.data]
      return (
        <div>
          <span role="string">
            {data.map((_key, item) => (
              <span key={Math.random()}>{JSON.stringify(item)}</span>
            ))}
          </span>
          <span>{state.data.size}</span>

          <button
            role="add"
            onClick={() => {
              state.data.set({ type: 'addObject' }, { type: 'obj_obj' })
              state.data.set('addOrigin', 'string_string')
              dispatch()
            }}
          >
            add
          </button>
          <button
            role="delete"
            onClick={() => {
              state.data.delete(obj)
              dispatch()
            }}
          >
            delete
          </button>
          <button
            role="clear"
            onClick={() => {
              state.data.clear()
              dispatch()
            }}
          >
            clear
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    let currentStringifiedKeySourceMapSize = 3
    let currentSourceMapSize = 4

    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(4)

    fireEvent.click(screen.getByRole('add'))
    currentStringifiedKeySourceMapSize = 4
    currentSourceMapSize = 5
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(6)

    fireEvent.click(screen.getByRole('delete'))
    currentStringifiedKeySourceMapSize = 3
    currentSourceMapSize = 4
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(5)

    fireEvent.click(screen.getByRole('clear'))
    currentStringifiedKeySourceMapSize = 0
    currentSourceMapSize = 0
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
    expect(screen.getByRole('string').children.length).toBe(0)
  })

  it('component destroyed', () => {
    const obj = { type: 'map' }
    const symbol = Symbol('symbolKey')

    initStore(
      new Map<any, any>([
        ['name', 'string_xpz'],
        [obj, 'obj_string'],
        [1, 'number_string'],
        [symbol, { type: 'symbol_obj' }],
      ]),
    )

    function Child() {
      let state = useStore()

      const objData = state.data.get(obj)
      return (
        <div>
          <span role="string">{JSON.stringify(objData)}</span>
        </div>
      )
    }

    function Parent() {
      let state = useStore()
      const [show, setShow] = React.useState(true)

      const symbolData = state.data.get(symbol)
      return (
        <div>
          <span role="string">{JSON.stringify(symbolData)}</span>
          <button
            role="button"
            onClick={() => {
              setShow(false)
            }}
          >
            hide
          </button>
          {show && <Child></Child>}
        </div>
      )
    }

    render(<Parent />, { legacyRoot: reactLegency })

    let currentStringifiedKeySourceMapSize = 2
    let currentSourceMapSize = 3

    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)

    fireEvent.click(screen.getByRole('button'))
    currentStringifiedKeySourceMapSize = 1
    currentSourceMapSize = 2
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
  })

  it('component mounted', () => {
    const obj = { type: 'map' }
    const symbol = Symbol('symbolKey')

    initStore(
      new Map<any, any>([
        ['name', 'string_xpz'],
        [obj, 'obj_string'],
        [1, 'number_string'],
        [symbol, { type: 'symbol_obj' }],
      ]),
    )

    function Child() {
      let state = useStore()

      const objData = state.data.get(obj)
      return (
        <div>
          <span role="string">{JSON.stringify(objData)}</span>
        </div>
      )
    }

    function Parent() {
      let state = useStore()
      const [show, setShow] = React.useState(false)

      const symbolData = state.data.get(symbol)
      return (
        <div>
          <span role="string">{JSON.stringify(symbolData)}</span>
          <button
            role="button"
            onClick={() => {
              setShow(true)
            }}
          >
            show
          </button>
          {show && <Child></Child>}
        </div>
      )
    }

    render(<Parent />, { legacyRoot: reactLegency })

    let currentStringifiedKeySourceMapSize = 1
    let currentSourceMapSize = 2

    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)

    fireEvent.click(screen.getByRole('button'))
    currentStringifiedKeySourceMapSize = 2
    currentSourceMapSize = 3
    expect(keyCaches_StringifiedKeySourceMap.size).toBe(
      currentStringifiedKeySourceMapSize,
    )
    expect(keyCaches_SourceMap.size).toBe(currentSourceMapSize)
  })
})
