import { createStore } from '../src'

function initStore(storeName?: string, options?: { strictMode?: boolean }) {
  const initState = {
    name: 'wohoox-default-test',
  }

  const store = createStore({
    name: storeName,
    initState,
    actions: {
      updateName(state, name: string) {
        state.name = name
      },

      deleteName(state) {
        delete (state as any).name
      },

      addNewKey(state, key, value) {
        ;(state as any)[key] = value
      },
    },
    options,
  })

  return { store, initState }
}

describe('update by expression', () => {
  it('modify value: failed in strict mode', () => {
    const {
      store: { state },
    } = initStore()

    let errMessage = ''

    expect(state.name).toBe('wohoox-default-test')

    try {
      state.name = 'wohoox'
    } catch (e: any) {
      errMessage = e
    }

    expect(state.name).toBe('wohoox-default-test')
    expect(errMessage).toBeInstanceOf(Error)
  })
  it('modify value: succeed not in strict mode', () => {
    const {
      store: { state },
    } = initStore(undefined, { strictMode: false })

    let errMessage = ''

    expect(state.name).toBe('wohoox-default-test')

    try {
      state.name = 'wohoox'
    } catch (e: any) {
      errMessage = e
    }

    expect(state.name).toBe('wohoox')
    expect(errMessage).toBe('')
  })

  it('delete key: failed in strict mode', () => {
    const {
      store: { state },
    } = initStore()

    let errMessage = ''

    expect(state.name).toBe('wohoox-default-test')

    try {
      delete (state as any).name
    } catch (e: any) {
      errMessage = e
    }

    expect(state.name).toBe('wohoox-default-test')
    expect(errMessage).toBeInstanceOf(Error)
  })
  it('delete key: succeed not in strict mode', () => {
    const {
      store: { state },
    } = initStore(undefined, { strictMode: false })

    let errMessage = ''

    expect(state.name).toBe('wohoox-default-test')

    try {
      delete (state as any).name
    } catch (e: any) {
      errMessage = e
    }

    expect(state.name).toBeFalsy()
    expect(errMessage).toBe('')
  })

  it('add key: failed in strict mode', () => {
    const {
      store: { state },
    } = initStore()

    let errMessage = ''

    expect((state as any).addKey).toBeFalsy()

    try {
      ;(state as any).addKey = 'addKey'
    } catch (e: any) {
      errMessage = e
    }

    expect((state as any).addKey).toBeFalsy()
    expect(errMessage).toBeInstanceOf(Error)
  })
  it('add key: succeed not in strict mode', () => {
    const {
      store: { state },
    } = initStore(undefined, { strictMode: false })

    let errMessage = ''

    expect((state as any).addKey).toBeFalsy()

    try {
      ;(state as any).addKey = 'addKey'
    } catch (e: any) {
      errMessage = e
    }

    expect((state as any).addKey).toBe('addKey')
    expect(errMessage).toBeFalsy()
  })
})

describe('update by action', () => {
  it('modify value: succeed in strict mode', () => {
    const {
      store: { state, actions },
    } = initStore()

    expect(state.name).toBe('wohoox-default-test')

    actions.updateName('wohoox')

    expect(state.name).toBe('wohoox')
  })
  it('modify value: succeed not in strict mode', () => {
    const {
      store: { state, actions },
    } = initStore(undefined, { strictMode: false })

    expect(state.name).toBe('wohoox-default-test')

    actions.updateName('wohoox')

    expect(state.name).toBe('wohoox')
  })

  it('delete key: failed in strict mode', () => {
    const {
      store: { state, actions },
    } = initStore()
    expect(state.name).toBe('wohoox-default-test')

    actions.deleteName()

    expect(state.name).toBeFalsy()
  })
  it('delete key: succeed not in strict mode', () => {
    const {
      store: { state, actions },
    } = initStore(undefined, { strictMode: false })
    expect(state.name).toBe('wohoox-default-test')

    actions.deleteName()

    expect(state.name).toBeFalsy()
  })

  it('add key: failed in strict mode', () => {
    const {
      store: { state, actions },
    } = initStore()
    expect((state as any).addKey).toBeFalsy()

    actions.addNewKey('addKey', 'addKey')

    expect((state as any).addKey).toBe('addKey')
  })
  it('add key: succeed not in strict mode', () => {
    const {
      store: { state, actions },
    } = initStore(undefined, { strictMode: false })
    expect((state as any).addKey).toBeFalsy()

    actions.addNewKey('addKey', 'addKey')

    expect((state as any).addKey).toBe('addKey')
  })
})
