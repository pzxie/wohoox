import * as React from 'react'
import { fireEvent, cleanup, render, screen } from '@testing-library/react'
import { clearStore } from 'wohoox'

import { createStore } from '../src'

const reactLegency = !!process.env.reactLegency

beforeEach(() => {
  cleanup()
  clearStore()
})

it('store: properties', () => {
  const store = createStore({
    initState: {
      name: 'wohoox',
    },
  })

  expect(store).toHaveProperty('store')
  expect(store).toHaveProperty('useStore')
  expect(store).toHaveProperty('useWohooxState')
  expect(store.store).toHaveProperty('name')
  expect(store.store).toHaveProperty('state')
  expect(store.store).toHaveProperty('actions')
})

it('name: default as [default]', () => {
  const { store } = createStore({
    initState: {},
  })

  expect(store.name).toBe('default')
})

it('name: manual settled', () => {
  const { store } = createStore({
    name: 'wohoox',
    initState: {},
  })

  expect(store.name).toBe('wohoox')
})

it('state: init state', () => {
  const { store } = createStore({
    initState: {
      name: 'wohoox',
    },
  })

  expect(store.state).toHaveProperty('name')
  expect(store.state.name).toBe('wohoox')
})

it('actions', () => {
  const { store } = createStore({
    initState: {
      name: 'wohoox',
    },
    actions: {
      updateName(state, name) {
        state.name = name
      },
    },
  })

  expect(store.actions).toHaveProperty('updateName')
  expect(store.actions).toHaveProperty('reset')

  expect(store.state.name).toBe('wohoox')

  store.actions.updateName('update')
  expect(store.state.name).toBe('update')

  store.actions.reset({
    name: 'reset',
  })
  expect(store.state.name).toBe('reset')
})

describe('useStore', () => {
  describe('state', () => {
    it('store state equals useStore state', () => {
      let { store, useStore } = createStore({
        initState: {
          name: 'wohoox',
        },
      })

      let isStateEqual = false

      function Child() {
        const { state } = useStore()

        React.useEffect(() => {
          isStateEqual = JSON.stringify(state) === JSON.stringify(store.state)
        }, [])

        return <div>Child</div>
      }

      render(<Child />, { legacyRoot: reactLegency })

      expect(isStateEqual).toBe(true)
    })

    it('get all state', () => {
      let { useStore } = createStore({
        initState: {
          name: 'wohoox',
        },
      })

      let storeState

      function Child() {
        const { state } = useStore()

        React.useEffect(() => {
          storeState = state
        }, [])

        return <div>Child</div>
      }

      render(<Child />, { legacyRoot: reactLegency })

      expect(JSON.stringify(storeState)).toBe(
        JSON.stringify({
          name: 'wohoox',
        }),
      )
    })

    it('get state field', () => {
      let { useStore } = createStore({
        initState: {
          name: 'wohoox',
        },
      })

      function Child() {
        const { state: stateName } = useStore(s => s.name)

        return (
          <div>
            <span>{stateName}</span>
          </div>
        )
      }

      const { container } = render(<Child />, { legacyRoot: reactLegency })

      expect(container.querySelector('span')?.innerHTML).toBe('wohoox')
    })
  })

  describe('actions', () => {
    it('actions contain reset', () => {
      let { useStore } = createStore({
        initState: {
          name: 'wohoox',
        },
      })

      let storeAction

      function Child() {
        const { actions } = useStore()

        React.useEffect(() => {
          storeAction = actions
        })

        return <div></div>
      }

      render(<Child />, { legacyRoot: reactLegency })

      expect(storeAction).toHaveProperty('reset')
    })

    it('reset state', () => {
      let { useStore } = createStore({
        initState: {
          name: 'wohoox',
        },
      })

      function Child() {
        const { state, actions } = useStore()

        return (
          <div>
            <span role="name">{state.name}</span>
            <button
              role="resetBtn"
              onClick={() => {
                actions.reset({
                  name: 'reset',
                })
              }}
            >
              reset
            </button>
          </div>
        )
      }

      render(<Child />, { legacyRoot: reactLegency })

      const resetBtn = screen.getByRole('resetBtn')
      const nameText = screen.getByRole('name')

      expect(nameText.innerHTML).toBe('wohoox')

      fireEvent.click(resetBtn)
      expect(nameText.innerHTML).toBe('reset')
    })

    it('actions contain custom action', () => {
      let { useStore } = createStore({
        initState: {
          name: 'wohoox',
        },
        actions: {
          update() {},
        },
      })

      let storeAction

      function Child() {
        const { actions } = useStore()

        React.useEffect(() => {
          storeAction = actions
        })

        return <div></div>
      }

      render(<Child />, { legacyRoot: reactLegency })

      expect(storeAction).toHaveProperty('update')
    })

    it('update state with custom action', () => {
      let { useStore } = createStore({
        initState: {
          name: 'wohoox',
          obj: {
            field: 'obj',
          },
        },
        actions: {
          updateName(state, name) {
            state.name = name
          },
          updateObj(state, obj: typeof state.obj) {
            state.obj = { ...obj }
          },
        },
      })

      function Child() {
        const { state, actions } = useStore()

        return (
          <div>
            <span role="name">{state.name}</span>
            <span role="field">{state.obj.field}</span>
            <button
              role="updateName"
              onClick={() => {
                actions.updateName('updateName')
              }}
            >
              updateName
            </button>
            <button
              role="updateObj"
              onClick={() => {
                actions.updateObj({ field: 'newObj' })
              }}
            >
              updateObj
            </button>
          </div>
        )
      }

      render(<Child />, { legacyRoot: reactLegency })

      const updateNameBtn = screen.getByRole('updateName')
      const updateObjBtn = screen.getByRole('updateObj')
      const nameText = screen.getByRole('name')
      const fieldText = screen.getByRole('field')

      expect(nameText.innerHTML).toBe('wohoox')
      expect(fieldText.innerHTML).toBe('obj')

      fireEvent.click(updateNameBtn)
      expect(nameText.innerHTML).toBe('updateName')
      expect(fieldText.innerHTML).toBe('obj')

      fireEvent.click(updateObjBtn)
      expect(nameText.innerHTML).toBe('updateName')
      expect(fieldText.innerHTML).toBe('newObj')
    })
  })
})

describe('useWohooxState', () => {
  it('store state equals useWohooxState state', () => {
    let { store, useWohooxState } = createStore({
      initState: {
        name: 'wohoox',
      },
    })

    let isStateEqual = false

    function Child() {
      const state = useWohooxState()

      React.useEffect(() => {
        isStateEqual = JSON.stringify(state) === JSON.stringify(store.state)
      }, [])

      return <div>Child</div>
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(isStateEqual).toBe(true)
  })

  it('get all state', () => {
    let { useWohooxState } = createStore({
      initState: {
        name: 'wohoox',
      },
    })

    let storeState

    function Child() {
      const state = useWohooxState()

      React.useEffect(() => {
        storeState = state
      }, [])

      return <div>Child</div>
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(JSON.stringify(storeState)).toBe(
      JSON.stringify({
        name: 'wohoox',
      }),
    )
  })

  it('get state field', () => {
    let { useWohooxState } = createStore({
      initState: {
        name: 'wohoox',
      },
    })

    function Child() {
      const stateName = useWohooxState(s => s.name)

      return (
        <div>
          <span>{stateName}</span>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe('wohoox')
  })
})
