import * as React from 'react'
import { fireEvent, cleanup, render, screen } from '@testing-library/react'

import createStore, { useStore, dispatch } from '../src'

const reactLegency = !!process.env.reactLegency

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

afterEach(cleanup)

describe('single component', () => {
  it('string', () => {
    const { initState } = initStore()

    const initString = initState.type.string
    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.type.string}</span>
          <button
            onClick={() => {
              state.type.string += '_1'
              dispatch()
            }}
          >
            update string
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(initString)

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(initString + '_1')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(initString + '_1_1')
  })

  it('number', () => {
    const { initState } = initStore()

    const initData = initState.type.number
    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.type.number}</span>
          <button
            onClick={() => {
              state.type.number += 1
              dispatch()
            }}
          >
            update number
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(initData + '')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(initData + 1 + '')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(initData + 2 + '')
  })

  it('boolean', () => {
    const { initState } = initStore()

    const initData = initState.type.boolean
    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.type.boolean + ''}</span>
          <button
            onClick={() => {
              state.type.boolean = !state.type.boolean
              dispatch()
            }}
          >
            update boolean
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(initData + '')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(!initData + '')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(initData + '')
  })

  it('null', () => {
    const { initState } = initStore()

    const initData = initState.type.null
    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.type.null + ''}</span>
          <button
            onClick={() => {
              state.type.null = state.type.null ? null : true
              dispatch()
            }}
          >
            update null
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(initData + '')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(true + '')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(initData + '')
  })

  it('undefined', () => {
    const { initState } = initStore()

    const initData = initState.type.undefined
    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.type.undefined + ''}</span>
          <button
            onClick={() => {
              state.type.undefined = state.type.undefined ? undefined : true
              dispatch()
            }}
          >
            update undefined
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(initData + '')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(true + '')

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(initData + '')
  })

  it('symbol', () => {
    const { initState } = initStore()

    const initData = initState.type.symbol.toString()
    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.type.symbol.toString()}</span>
          <button
            onClick={() => {
              state.type.symbol = Symbol(state.type.symbol.description + '_1')
              dispatch()
            }}
          >
            update symbol
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(initData)

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(
      initData.slice(0, -1) + '_1' + ')',
    )

    fireEvent.click(container.querySelector('button')!)
    expect(container.querySelector('span')?.innerHTML).toBe(
      initData.slice(0, -1) + '_1_1' + ')',
    )
  })
})

describe('multi components', () => {
  it('string', () => {
    const { initState } = initStore()

    let initString = initState.type.string
    function Child() {
      let state = useStore()

      return (
        <div>
          <span role="childText">{state.type.string}</span>
          <button
            role="updateBtn"
            onClick={() => {
              state.type.string += '_1'
              dispatch()
            }}
          >
            update string
          </button>
        </div>
      )
    }

    function Siblings() {
      let state = useStore()

      return (
        <div>
          <span role="siblingsText">{state.type.string}</span>
        </div>
      )
    }

    function Parent() {
      let state = useStore()
      return (
        <div>
          <span role="parentText">{state.type.string}</span>
          <button
            role="updateFromParentBtn"
            onClick={() => {
              state.type.string += '_2'
              dispatch()
            }}
          >
            update string
          </button>
          <Child></Child>
          <Siblings></Siblings>
        </div>
      )
    }

    render(<Parent />, { legacyRoot: reactLegency })

    const childText = screen.getByRole('childText')
    const siblingsText = screen.getByRole('siblingsText')
    const parentText = screen.getByRole('parentText')
    const updateBtn = screen.getByRole('updateBtn')
    const updateFromParentBtn = screen.getByRole('updateFromParentBtn')

    expect(childText.innerHTML).toBe(initString)
    expect(siblingsText.innerHTML).toBe(initString)
    expect(parentText.innerHTML).toBe(initString)

    fireEvent.click(updateBtn)
    initString += '_1'
    expect(childText.innerHTML).toBe(initString)
    expect(siblingsText.innerHTML).toBe(initString)
    expect(parentText.innerHTML).toBe(initString)

    fireEvent.click(updateFromParentBtn)
    initString += '_2'
    expect(childText.innerHTML).toBe(initString)
    expect(siblingsText.innerHTML).toBe(initString)
    expect(parentText.innerHTML).toBe(initString)

    fireEvent.click(updateBtn)
    initString += '_1'
    expect(childText.innerHTML).toBe(initString)
    expect(siblingsText.innerHTML).toBe(initString)
    expect(parentText.innerHTML).toBe(initString)

    fireEvent.click(updateBtn)
    initString += '_1'
    expect(childText.innerHTML).toBe(initString)
    expect(siblingsText.innerHTML).toBe(initString)
    expect(parentText.innerHTML).toBe(initString)
  })
})
