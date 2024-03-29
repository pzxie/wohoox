import { createStore } from '../src'
import { clearStore } from 'wohoox'

function initStore(storeName?: string, options?: { strictMode?: boolean }) {
  const initState = {
    name: 'wohoox-default-test',
    version: {
      major: 1,
      minor: 1,
      patch: 1,
    },
    author: {
      name: 'pzxie',
      address: {
        city: 'cd',
        province: 'cs',
      },
    },
  }

  const { store } = createStore({
    name: storeName,
    initState,
    actions: {
      user: {
        aa() {},
      },
      updateName(state, name: string) {
        state.name = name
      },
      updatePatch(state) {
        state.version.patch += 1
      },

      updateVersion(state, version: string) {
        const versionArr = version.split('.')

        if (versionArr.length !== 3) {
          throw new Error('version update error. version liked 1.2.3')
        }

        state.version = {
          major: +versionArr[0],
          minor: +versionArr[1],
          patch: +versionArr[2],
        }
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

beforeEach(clearStore)

describe('purejs: store name', () => {
  it('equals "default"', () => {
    const { store } = initStore()
    store.actions.user.aa()
    expect(store.name).toEqual('default')
  })

  it('equals "userinfo" by manual set"', () => {
    const name = 'userinfo'
    const { store } = initStore(name)
    expect(store.name).toEqual(name)
  })
})

describe('purejs: get state', () => {
  it('original field', () => {
    const { store } = initStore()
    expect(store.state.name).toBe('wohoox-default-test')
  })

  it('reference object', () => {
    const {
      store: { state },
    } = initStore()
    expect(
      [state.version.major, state.version.minor, state.version.patch].join('.'),
    ).toBe('1.1.1')
  })
})

describe('purejs: update by actions', () => {
  it('update original type filed', () => {
    const {
      store: { actions, state },
    } = initStore()
    const name = 'wohoox'
    actions.updateName(name)

    expect(state.name).toBe(name)
  })

  it('update field of reference object', () => {
    const {
      store: { actions, state },
    } = initStore()

    expect(
      [state.version.major, state.version.minor, state.version.patch].join('.'),
    ).toBe('1.1.1')
    actions.updatePatch()
    expect(
      [state.version.major, state.version.minor, state.version.patch].join('.'),
    ).toBe('1.1.2')
  })

  it('update reference object address failed', () => {
    const {
      store: { actions },
    } = initStore()

    const version = '2.1'
    expect(() => actions.updateVersion(version)).toThrow(/version update error/)
  })

  it('update reference object address success', () => {
    const {
      store: { actions, state },
    } = initStore()

    const version = '2.1.2'
    actions.updateVersion(version)
    expect(
      [state.version.major, state.version.minor, state.version.patch].join('.'),
    ).toBe(version)
  })

  it('delete field', () => {
    const {
      store: { actions, state },
    } = initStore()
    expect(state.name).toBe('wohoox-default-test')

    actions.deleteName()

    expect(state.name).toBeFalsy()
  })

  it('add field', () => {
    const {
      store: { actions, state },
    } = initStore()
    expect(state['newKey']).toBeFalsy()

    actions.addNewKey('newKey', 'newKey')

    expect(state['newKey']).toBe('newKey')
  })
})

describe('purejs: update by expression', () => {
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
