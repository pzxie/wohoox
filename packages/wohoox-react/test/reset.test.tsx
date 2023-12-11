import * as React from 'react'
import { fireEvent, cleanup, render, screen } from '@testing-library/react'
import { clearStore } from 'wohoox'

import { createStore, useStore, combineStores } from '../src'

const reactLegency = !!process.env.reactLegency

afterEach(() => {
  cleanup()
  clearStore()
})

it('reset in actions default', () => {
  const { store } = createStore({
    initState: {
      name: 'wohoox',
    },
  })

  expect(store.actions).toHaveProperty('reset')
})
it('ignore custom reset', () => {
  const logSpy = jest.spyOn(global.console, 'warn')

  const { store } = createStore({
    initState: {
      name: 'wohoox',
    },
    actions: {
      reset(state, name) {
        state.name = name
      },
    },
  })

  function Child() {
    let state = useStore()

    return (
      <div>
        <span>{state.name}</span>

        <button
          onClick={() => {
            store.actions.reset({
              name: 'reset',
            })
          }}
        >
          update
        </button>
      </div>
    )
  }

  const { container } = render(<Child />, { legacyRoot: reactLegency })

  expect(container.querySelector('span')?.innerHTML).toBe('wohoox')
  expect(logSpy).toHaveBeenCalled()
  expect(logSpy).toHaveBeenCalledWith(
    'The action named [reset] is a built-in action of wohoox. If you declared [reset], it will be ignored.',
  )

  const updateNameBtn = container.querySelector('button')!
  fireEvent.click(updateNameBtn)

  expect(container.querySelector('span')?.innerHTML).toBe('reset')
  logSpy.mockRestore()
})

describe('init state by object', () => {
  it('reset by object', () => {
    const { store } = createStore({
      initState: {
        name: 'wohoox',
      },
    })

    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.name}</span>

          <button
            onClick={() => {
              store.actions.reset({
                name: 'reset',
              })
            }}
          >
            update
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe('wohoox')

    const updateNameBtn = container.querySelector('button')!
    fireEvent.click(updateNameBtn)

    expect(container.querySelector('span')?.innerHTML).toBe('reset')
  })
})

describe('init state by factory method', () => {
  it('reset by no params', () => {
    const defaultName = 'wohoox'
    const updateName = 'updateName'
    const { store } = createStore({
      initState: () => ({
        name: defaultName,
      }),
      actions: {
        updateName(state, name: string) {
          state.name = name
        },
      },
    })

    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.name}</span>

          <button
            role="updateNameBtn"
            onClick={() => {
              store.actions.updateName(updateName)
            }}
          >
            update
          </button>
          <button
            role="resetBtn"
            onClick={() => {
              store.actions.reset()
            }}
          >
            update
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(defaultName)

    fireEvent.click(screen.getByRole('updateNameBtn'))
    expect(container.querySelector('span')?.innerHTML).toBe(updateName)

    fireEvent.click(screen.getByRole('resetBtn'))
    expect(container.querySelector('span')?.innerHTML).toBe(defaultName)
  })
  it('reset by object', () => {
    const defaultName = 'wohoox'
    const updateName = 'updateName'
    const updateByResetObject = {
      name: 'updateByResetObject',
    }
    const { store } = createStore({
      initState: () => ({
        name: defaultName,
      }),
      actions: {
        updateName(state, name: string) {
          state.name = name
        },
      },
    })

    function Child() {
      let state = useStore()

      return (
        <div>
          <span>{state.name}</span>

          <button
            role="updateNameBtn"
            onClick={() => {
              store.actions.updateName(updateName)
            }}
          >
            update
          </button>
          <button
            role="resetBtn"
            onClick={() => {
              store.actions.reset(updateByResetObject)
            }}
          >
            update
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(defaultName)

    fireEvent.click(screen.getByRole('updateNameBtn'))
    expect(container.querySelector('span')?.innerHTML).toBe(updateName)

    fireEvent.click(screen.getByRole('resetBtn'))
    expect(container.querySelector('span')?.innerHTML).toBe(
      updateByResetObject.name,
    )
  })
})

it('combineStores', () => {
  const defaultStore = createStore({
    initState: () => ({
      name: 'defaultWohoox',
    }),
    actions: {
      updateName(state, name: string) {
        state.name = name
      },
    },
  })

  const userStore = createStore({
    name: 'user',
    initState: () => ({
      name: 'defaultWohoox',
    }),
    actions: {
      updateName(state, name: string) {
        state.name = name
      },
    },
  })

  const { store, actions } = combineStores(defaultStore.store, userStore.store)

  expect(store.default.actions).toHaveProperty('reset')
  expect(store.user.actions).toHaveProperty('reset')
  expect(actions.default).toHaveProperty('reset')
  expect(actions.user).toHaveProperty('reset')
})
