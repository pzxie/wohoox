import { cleanup } from '@testing-library/react'

import createStore, { combineStores } from '../src/index'

beforeEach(cleanup)

it('store: properties', () => {
  const store = createStore({
    initState: {
      name: 'wohoox',
    },
  })

  expect(store).toHaveProperty('name')
  expect(store).toHaveProperty('state')
  expect(store).toHaveProperty('actions')
})

it('name: default as [default]', () => {
  const store = createStore({
    initState: {},
  })

  expect(store.name).toBe('default')
})

it('name: manual settled', () => {
  const store = createStore({
    name: 'wohoox',
    initState: {},
  })

  expect(store.name).toBe('wohoox')
})

it('state: init state', () => {
  const store = createStore({
    initState: {
      name: 'wohoox',
    },
  })

  expect(store.state).toHaveProperty('name')
})

it('actions', () => {
  const store = createStore({
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
})

it('combineStores', () => {
  const defaultStore = createStore({
    initState: {
      type: 'default',
    },
    actions: {
      updateType(state, type) {
        state.type = type
      },
    },
  })
  const userStore = createStore({
    name: 'user',
    initState: {
      name: 'wohoox',
    },
    actions: {
      updateName(state, name) {
        state.name = name
      },
    },
  })

  const combineResult = combineStores(defaultStore, userStore)

  expect(combineResult).toHaveProperty('store')
  expect(combineResult).toHaveProperty('actions')
  expect(combineResult.store).toHaveProperty('default')
  expect(combineResult.store).toHaveProperty('user')
  expect(combineResult.store.default).toHaveProperty('name')
  expect(combineResult.store.default).toHaveProperty('state')
  expect(combineResult.store.default).toHaveProperty('actions')
  expect(combineResult.store.default.state).toHaveProperty('type')
  expect(combineResult.store.default.actions).toHaveProperty('updateType')
  expect(combineResult.store.user).toHaveProperty('name')
  expect(combineResult.store.user).toHaveProperty('state')
  expect(combineResult.store.user).toHaveProperty('actions')
  expect(combineResult.store.user.state).toHaveProperty('name')
  expect(combineResult.store.user.actions).toHaveProperty('updateName')

  expect(combineResult.actions).toHaveProperty('default')
  expect(combineResult.actions.default).toHaveProperty('updateType')
  expect(combineResult.actions).toHaveProperty('user')
  expect(combineResult.actions.user).toHaveProperty('updateName')
})
