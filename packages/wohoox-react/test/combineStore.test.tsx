import * as React from 'react'
import { fireEvent, cleanup, render, screen } from '@testing-library/react'
import { clearStore } from 'wohoox'

import { createStore, combineStores } from '../src'

const reactLegency = !!process.env.reactLegency

beforeEach(() => {
  cleanup()
  clearStore()
})

function initStore() {
  const AStore = createStore({
    name: 'a',
    initState: {
      name: 'a',
    },
  })

  const BStore = createStore({
    name: 'b',
    initState: () => ({
      name: 'b',
    }),
    actions: {
      updateNameForB(state, name) {
        state.name = name
      },
    },
  })

  const CStore = createStore({
    name: 'c',
    initState: {
      name: 'c',
      obj: {
        deep: true,
      },
    },
    actions: {
      updateNameForC(state, name) {
        state.name = name
      },
      updateDeepFieldForC(state, isDeep) {
        state.obj.deep = isDeep
      },
    },
  })

  return combineStores(AStore.store, BStore.store, CStore.store)
}

describe('store', () => {
  it('properties', () => {
    const store = initStore()

    expect(store).toHaveProperty('store')
    expect(store).toHaveProperty('actions')
    expect(store).toHaveProperty('useWohooxState')
    expect(store).toHaveProperty('useStore')

    expect(store.store).toHaveProperty('a')
    expect(store.store.a).toHaveProperty('name')
    expect(store.store.a).toHaveProperty('state')
    expect(store.store.a).toHaveProperty('actions')

    expect(store.store).toHaveProperty('b')
    expect(store.store.b).toHaveProperty('name')
    expect(store.store.b).toHaveProperty('state')
    expect(store.store.b).toHaveProperty('actions')

    expect(store.store).toHaveProperty('c')
    expect(store.store.c).toHaveProperty('name')
    expect(store.store.c).toHaveProperty('state')
    expect(store.store.c).toHaveProperty('actions')
  })

  it('state', () => {
    const store = initStore()

    expect(store.store.a.state).toHaveProperty('name')
    expect(store.store.a.state.name).toBe('a')

    expect(store.store.b.state).toHaveProperty('name')
    expect(store.store.b.state.name).toBe('b')

    expect(store.store.c.state).toHaveProperty('name')
    expect(store.store.c.state.name).toBe('c')
    expect(store.store.c.state).toHaveProperty('obj')
    expect(JSON.stringify(store.store.c.state.obj)).toBe(
      JSON.stringify({ deep: true }),
    )
  })

  it('actions', () => {
    const store = initStore()

    expect(store.store.a.actions).toHaveProperty('reset')
    expect(store.store.a.state.name).toBe('a')
    store.store.a.actions.reset({ name: 'resetA' })
    expect(store.store.a.state.name).toBe('resetA')

    expect(store.store.b.actions).toHaveProperty('reset')
    expect(store.store.b.actions).toHaveProperty('updateNameForB')
    expect(store.store.b.state.name).toBe('b')
    store.store.b.actions.updateNameForB('updateB')
    expect(store.store.b.state.name).toBe('updateB')
    store.store.b.actions.reset()
    expect(store.store.b.state.name).toBe('b')

    expect(store.store.c.actions).toHaveProperty('reset')
    expect(store.store.c.actions).toHaveProperty('updateNameForC')
    expect(store.store.c.actions).toHaveProperty('updateDeepFieldForC')
    expect(store.store.c.state.name).toBe('c')
    expect(store.store.c.state.obj.deep).toBe(true)
    store.store.c.actions.updateNameForC('updateC')
    expect(store.store.c.state.name).toBe('updateC')
    store.store.c.actions.updateDeepFieldForC(false)
    expect(JSON.stringify(store.store.c.state.obj)).toBe(
      JSON.stringify({ deep: false }),
    )
    store.store.c.actions.reset({
      name: 'c',
      obj: {
        deep: true,
      },
    })
    expect(store.store.c.state.name).toBe('c')
    expect(store.store.c.state.obj.deep).toBe(true)
  })
})

it('actions', () => {
  const { actions, store } = initStore()

  expect(actions).toHaveProperty('a')
  expect(actions).toHaveProperty('b')
  expect(actions).toHaveProperty('c')

  expect(actions.a).toHaveProperty('reset')
  expect(store.a.state.name).toBe('a')
  actions.a.reset({ name: 'resetA' })
  expect(store.a.state.name).toBe('resetA')

  expect(actions.b).toHaveProperty('reset')
  expect(actions.b).toHaveProperty('updateNameForB')
  expect(store.b.state.name).toBe('b')
  store.b.actions.updateNameForB('updateB')
  expect(store.b.state.name).toBe('updateB')
  actions.b.reset()
  expect(store.b.state.name).toBe('b')

  expect(actions.c).toHaveProperty('reset')
  expect(actions.c).toHaveProperty('updateNameForC')
  expect(actions.c).toHaveProperty('updateDeepFieldForC')
  expect(store.c.state.name).toBe('c')
  expect(store.c.state.obj.deep).toBe(true)
  actions.c.updateNameForC('updateC')
  expect(store.c.state.name).toBe('updateC')
  actions.c.updateDeepFieldForC(false)
  expect(JSON.stringify(store.c.state.obj)).toBe(
    JSON.stringify({ deep: false }),
  )
  actions.c.reset({
    name: 'c',
    obj: {
      deep: true,
    },
  })
  expect(store.c.state.name).toBe('c')
  expect(store.c.state.obj.deep).toBe(true)
})

describe('useStore', () => {
  it('name is required', () => {
    let { useStore } = initStore()

    let error

    function Child() {
      // @ts-ignore
      useStore()

      return <div></div>
    }

    try {
      render(<Child />, { legacyRoot: reactLegency })
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe(
      'The first parameter of useStore returned by combineStores is required.',
    )
  })

  it('return fields contains state and action', () => {
    let { useStore } = initStore()

    let store

    function Child() {
      const s = useStore('a')

      React.useEffect(() => {
        store = s
      }, [])

      return <div></div>
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(store).toHaveProperty('state')
    expect(store).toHaveProperty('actions')
  })

  describe('state', () => {
    it('store state equals useStore state', () => {
      let { store, useStore } = initStore()

      let isStateEqual = false

      function Child() {
        const { state: stateA } = useStore('a')
        const { state: stateB } = useStore('b')
        const { state: stateC } = useStore('c')

        React.useEffect(() => {
          isStateEqual =
            JSON.stringify(stateA) === JSON.stringify(store.a.state) &&
            JSON.stringify(stateB) === JSON.stringify(store.b.state) &&
            JSON.stringify(stateC) === JSON.stringify(store.c.state)
        }, [])

        return <div>Child</div>
      }

      render(<Child />, { legacyRoot: reactLegency })

      expect(isStateEqual).toBe(true)
    })

    it('get all state', () => {
      const { useStore } = initStore()

      let storeStateA
      let storeStateB
      let storeStateC

      function Child() {
        const { state: stateA } = useStore('a')
        const { state: stateB } = useStore('b')
        const { state: stateC } = useStore('c')

        React.useEffect(() => {
          storeStateA = stateA
          storeStateB = stateB
          storeStateC = stateC
        }, [])

        return <div>Child</div>
      }

      render(<Child />, { legacyRoot: reactLegency })

      expect(JSON.stringify(storeStateA)).toBe(
        JSON.stringify({
          name: 'a',
        }),
      )
      expect(JSON.stringify(storeStateB)).toBe(
        JSON.stringify({
          name: 'b',
        }),
      )
      expect(JSON.stringify(storeStateC)).toBe(
        JSON.stringify({
          name: 'c',
          obj: {
            deep: true,
          },
        }),
      )
    })

    it('get state field', () => {
      let { useStore } = initStore()

      function Child() {
        const { state: stateNameA } = useStore('a', s => s.name)
        const { state: stateNameB } = useStore('b', s => s.name)
        const { state: stateNameC } = useStore('c', s => s.name)

        return (
          <div>
            <span role="aName">{stateNameA}</span>
            <span role="bName">{stateNameB}</span>
            <span role="cName">{stateNameC}</span>
          </div>
        )
      }

      render(<Child />, { legacyRoot: reactLegency })

      const aText = screen.getByRole('aName')
      const bText = screen.getByRole('bName')
      const cText = screen.getByRole('cName')

      expect(aText.innerHTML).toBe('a')
      expect(bText.innerHTML).toBe('b')
      expect(cText.innerHTML).toBe('c')
    })
  })

  describe('actions', () => {
    it('actions contain reset', () => {
      let { useStore } = initStore()

      let storeActions

      function Child() {
        const { actions: actionsA } = useStore('a')
        const { actions: actionsB } = useStore('b')
        const { actions: actionsC } = useStore('c')

        React.useEffect(() => {
          storeActions = {
            actionsA,
            actionsB,
            actionsC,
          }
        })

        return <div></div>
      }

      render(<Child />, { legacyRoot: reactLegency })

      expect(storeActions.actionsA).toHaveProperty('reset')
      expect(storeActions.actionsB).toHaveProperty('reset')
      expect(storeActions.actionsC).toHaveProperty('reset')
    })

    it('reset state', () => {
      let { useStore } = initStore()

      function Child() {
        const { state: stateA, actions: actionsA } = useStore('a')
        const { state: stateB, actions: actionsB } = useStore('b')
        const { state: stateC, actions: actionsC } = useStore('c')

        return (
          <div>
            <span role="nameA">{stateA.name}</span>
            <span role="nameB">{stateB.name}</span>
            <span role="nameC">{stateC.name}</span>
            <button
              role="resetBtnA"
              onClick={() => {
                actionsA.reset({
                  name: 'reset',
                })
              }}
            >
              reset
            </button>
            <button
              role="resetBtnB"
              onClick={() => {
                actionsB.reset({
                  name: 'reset',
                })
              }}
            >
              reset
            </button>
            <button
              role="resetBtnC"
              onClick={() => {
                actionsC.reset({
                  name: 'reset',
                  obj: { deep: true },
                })
              }}
            >
              reset
            </button>
          </div>
        )
      }

      render(<Child />, { legacyRoot: reactLegency })

      const resetBtnA = screen.getByRole('resetBtnA')
      const resetBtnB = screen.getByRole('resetBtnB')
      const resetBtnC = screen.getByRole('resetBtnC')
      const nameTextA = screen.getByRole('nameA')
      const nameTextB = screen.getByRole('nameB')
      const nameTextC = screen.getByRole('nameC')

      expect(nameTextA.innerHTML).toBe('a')
      expect(nameTextB.innerHTML).toBe('b')
      expect(nameTextC.innerHTML).toBe('c')

      fireEvent.click(resetBtnA)
      expect(nameTextA.innerHTML).toBe('reset')

      fireEvent.click(resetBtnB)
      expect(nameTextB.innerHTML).toBe('reset')

      fireEvent.click(resetBtnC)
      expect(nameTextB.innerHTML).toBe('reset')
    })

    it('actions contain custom action', () => {
      let { useStore } = initStore()

      let storeAction

      function Child() {
        const { actions: actionsB } = useStore('b')
        const { actions: actionsC } = useStore('c')

        React.useEffect(() => {
          storeAction = {
            actionsB,
            actionsC,
          }
        })

        return <div></div>
      }

      render(<Child />, { legacyRoot: reactLegency })

      expect(storeAction.actionsB).toHaveProperty('updateNameForB')
      expect(storeAction.actionsC).toHaveProperty('updateNameForC')
      expect(storeAction.actionsC).toHaveProperty('updateDeepFieldForC')
    })

    it('update state with custom action', () => {
      let { useStore } = initStore()

      function Child() {
        const { state: stateB, actions: actionsB } = useStore('b')
        const { state: stateC, actions: actionsC } = useStore('c')

        return (
          <div>
            <span role="name">{stateB.name}</span>
            <span role="obj">{stateC.obj.deep + ''}</span>
            <button
              role="updateName"
              onClick={() => {
                actionsB.updateNameForB('updateName')
              }}
            >
              updateName
            </button>
            <button
              role="updateObj"
              onClick={() => {
                actionsC.updateDeepFieldForC(false)
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
      const fieldText = screen.getByRole('obj')

      expect(nameText.innerHTML).toBe('b')
      expect(fieldText.innerHTML).toBe('true')

      fireEvent.click(updateNameBtn)
      expect(nameText.innerHTML).toBe('updateName')
      expect(fieldText.innerHTML).toBe('true')

      fireEvent.click(updateObjBtn)
      expect(nameText.innerHTML).toBe('updateName')
      expect(fieldText.innerHTML).toBe('false')
    })
  })
})

describe('useWohooxState', () => {
  it('store state equals useWohooxState state', () => {
    let { store, useWohooxState } = initStore()

    let isStateEqual = false

    function Child() {
      const stateA = useWohooxState('a')
      const stateB = useWohooxState('b')
      const stateC = useWohooxState('c')

      React.useEffect(() => {
        isStateEqual =
          JSON.stringify(stateA) === JSON.stringify(store.a.state) &&
          JSON.stringify(stateB) === JSON.stringify(store.b.state) &&
          JSON.stringify(stateC) === JSON.stringify(store.c.state)
      }, [])

      return <div>Child</div>
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(isStateEqual).toBe(true)
  })

  it('get all state', () => {
    let { useWohooxState } = initStore()

    let storeState

    function Child() {
      const stateA = useWohooxState('a')
      const stateB = useWohooxState('b')
      const stateC = useWohooxState('c')

      React.useEffect(() => {
        storeState = {
          stateA,
          stateB,
          stateC,
        }
      }, [])

      return <div>Child</div>
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(JSON.stringify(storeState.stateA)).toBe(
      JSON.stringify({
        name: 'a',
      }),
    )
    expect(JSON.stringify(storeState.stateB)).toBe(
      JSON.stringify({
        name: 'b',
      }),
    )
    expect(JSON.stringify(storeState.stateC)).toBe(
      JSON.stringify({
        name: 'c',
        obj: { deep: true },
      }),
    )
  })

  it('get state field', () => {
    let { useWohooxState } = initStore()

    function Child() {
      const stateName = useWohooxState('b', s => s.name)
      const deep = useWohooxState('c', s => s.obj.deep)

      return (
        <div>
          <span role="name">{stateName}</span>
          <span role="deep">{deep + ''}</span>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(screen.getByRole('name').innerHTML).toBe('b')
    expect(screen.getByRole('deep').innerHTML).toBe('true')
  })
})
