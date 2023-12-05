import { createStore, combineStores } from '../src/index'

it('reset in actions default', () => {
  const store = createStore({
    initState: {
      name: 'wohoox',
    },
  })

  expect(store.actions).toHaveProperty('reset')
})
it('ignore custom reset', () => {
  const logSpy = jest.spyOn(global.console, 'warn')

  const store = createStore({
    initState: {
      name: 'wohoox',
    },
    actions: {
      reset(state, name) {
        state.name = name
      },
    },
  })

  expect(logSpy).toHaveBeenCalled()
  expect(logSpy).toHaveBeenCalledWith(
    'The action named [reset] is a built-in action of wohoox. If you declared [reset], it will be ignored.',
  )

  const newName = 'default reset'
  store.actions.reset({
    name: newName,
  })

  expect(store.state.name).toBe(newName)

  logSpy.mockRestore()
})

describe('init state by object', () => {
  it('reset by object', () => {
    const store = createStore({
      initState: {
        name: 'wohoox',
      },
    })

    expect(store.state.name).toBe('wohoox')

    const newName = 'default reset'
    store.actions.reset({
      name: newName,
    })

    expect(store.state.name).toBe(newName)
  })
})

describe('init state by factory method', () => {
  it('reset by no params', () => {
    const defaultName = 'wohoox'
    const store = createStore({
      initState: () => ({
        name: defaultName,
      }),
      actions: {
        updateName(state, name: string) {
          state.name = name
        },
      },
    })

    expect(store.state.name).toBe(defaultName)

    const updateName = 'updateName'
    store.actions.updateName(updateName)
    expect(store.state.name).toBe(updateName)

    store.actions.reset()
    expect(store.state.name).toBe(defaultName)
  })
  it('reset by object', () => {
    const defaultName = 'wohoox'
    const store = createStore({
      initState: () => ({
        name: defaultName,
      }),
      actions: {
        updateName(state, name: string) {
          state.name = name
        },
      },
    })

    expect(store.state.name).toBe(defaultName)

    const updateName = 'updateName'
    store.actions.updateName(updateName)
    expect(store.state.name).toBe(updateName)

    const updateByResetObject = 'updateByResetObject'
    store.actions.reset({
      name: updateByResetObject,
    })
    expect(store.state.name).toBe(updateByResetObject)
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

  const store = combineStores(defaultStore, userStore)

  expect(store.actions.default).toHaveProperty('reset')
  expect(store.actions.user).toHaveProperty('reset')
})
