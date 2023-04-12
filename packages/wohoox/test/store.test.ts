import { createStore, combineStores } from '../src/index'

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
  expect(store.state.name).toBe('wohoox')
})

it('actions define check', () => {
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
  expect(store.actions.updateName).toBeInstanceOf(Function)
})

describe('options', () => {
  describe('strictMode', () => {
    it('true', () => {
      const store = createStore({
        initState: {
          name: 'wohoox',
        },
        actions: {
          updateName(state, name) {
            state.name = name
          },
        },
        options: { strictMode: true },
      })

      let error: any = null

      try {
        store.state.name += '_1'
      } catch (e) {
        error = e
      }

      expect(store.state.name).toBe('wohoox')
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain(
        'In the strict mode, state cannot be modified by expression. Only actions are allowed',
      )

      error = null
      store.actions.updateName('updated')
      expect(store.state.name).toBe('updated')
      expect(error).toBe(null)
    })
    it('false', () => {
      const store = createStore({
        initState: {
          name: 'wohoox',
        },
        actions: {
          updateName(state, name) {
            state.name = name
          },
        },
        options: { strictMode: false },
      })

      let error: any = null

      try {
        store.state.name = 'updatedByExpression'
      } catch (e) {
        error = e
      }

      expect(store.state.name).toBe('updatedByExpression')
      expect(error).toBe(null)

      store.actions.updateName('updatedByAction')
      expect(store.state.name).toBe('updatedByAction')
      expect(error).toBe(null)
    })
    it('check default as 【true】', () => {
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

      let error: any = null

      try {
        store.state.name += '_1'
      } catch (e) {
        error = e
      }

      expect(store.state.name).toBe('wohoox')
      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain(
        'In the strict mode, state cannot be modified by expression. Only actions are allowed',
      )
    })
  })

  describe('proxySetDeep', () => {
    it('true', () => {
      const obj = { type: 'obj' }
      let isChanged = false
      const store = createStore({
        initState: {
          name: 'wohoox',
          set: new Set([obj]),
        },
        actions: {
          updateObj(state) {
            const setOb = [...state.set][0]
            setOb.type = 'objChanged'
          },
        },
        plugins: [
          {
            onChange() {
              isChanged = true
            },
          },
        ],
        options: { proxySetDeep: true },
      })

      expect(isChanged).toBe(false)
      store.actions.updateObj()
      expect(isChanged).toBe(true)
      expect(obj.type).toBe('objChanged')
    })
    it('false', () => {
      const obj = { type: 'obj' }
      let isChanged = false
      const store = createStore({
        initState: {
          name: 'wohoox',
          set: new Set([obj]),
        },
        actions: {
          updateObj(state) {
            const setOb = [...state.set][0]
            setOb.type = 'objChanged'
          },
        },
        plugins: [
          {
            onChange() {
              isChanged = true
            },
          },
        ],
        options: { proxySetDeep: false },
      })

      expect(isChanged).toBe(false)
      store.actions.updateObj()
      expect(isChanged).toBe(false)
      expect(obj.type).toBe('objChanged')
    })
    it('check default as 【false】', () => {
      const obj = { type: 'obj' }
      let isChanged = false
      const store = createStore({
        initState: {
          name: 'wohoox',
          set: new Set([obj]),
        },
        actions: {
          updateObj(state) {
            const setOb = [...state.set][0]
            setOb.type = 'objChanged'
          },
        },
        plugins: [
          {
            onChange() {
              isChanged = true
            },
          },
        ],
      })

      expect(isChanged).toBe(false)
      store.actions.updateObj()
      expect(isChanged).toBe(false)
      expect(obj.type).toBe('objChanged')
    })
  })
})

it('combineStores define check', () => {
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
