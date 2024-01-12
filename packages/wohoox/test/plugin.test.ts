import { createStore } from '../src'

import { pluginsMap, ignoreToRecordEvent } from '../src/core/plugin'

beforeEach(() => {
  pluginsMap.clear()
})

it('plugin: init', () => {
  createStore({
    initState: {
      name: 'wohoox',
    },
    plugins: [() => ({}), () => ({})],
    options: { strictMode: false },
  })

  expect(pluginsMap.get('default')?.length).toBe(2)
})

describe('plugin: event', () => {
  it('beforeInit', () => {
    const store = createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          beforeInit(initState) {
            return {
              initState: {
                ...initState,
                name: 'beforeInit',
              },
            }
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect((store.state as any).name).toBe('beforeInit')
  })

  it('onInit', () => {
    let s

    createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          onInit(store) {
            s = store
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(s).toHaveProperty('name')
    expect(s).toHaveProperty('state')
    expect(s).toHaveProperty('actions')
    expect(s.state.name).toBe('wohoox')
  })

  it('onAdd', () => {
    let logs: any[] = []

    const store = createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          onAdd(name, value, keys) {
            logs.push([name, value, keys])
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(logs.length).toBe(0)
    ;(store.state as any).type = 'onAdd'
    expect(logs.length).toBe(1)
    expect(logs[0][0]).toBe('default')
    expect(logs[0][1]).toBe('onAdd')
    expect(logs[0][2].toString()).toBe('type')
    ;(store.state as any).other = 'other'
    expect(logs.length).toBe(2)
  })

  it('onDelete', () => {
    let logs: any[] = []

    const store = createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          onDelete(name, keys) {
            logs.push([name, keys])
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(logs.length).toBe(0)
    expect(store.state.name).toBe('wohoox')

    delete (store.state as any).name
    expect(logs.length).toBe(1)
    expect(logs[0][0]).toBe('default')
    expect(logs[0][1].toString()).toBe('name')

    expect(store.state.name).toBeFalsy()
  })

  it('onChange', () => {
    let logs: any[] = []

    const store = createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          onChange(name, value, keys, _target, oldValue) {
            logs.push([name, value, keys, oldValue])
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(logs.length).toBe(0)
    store.state.name = 'update'
    expect(logs.length).toBe(1)
    expect(logs[0][0]).toBe('default')
    expect(logs[0][1]).toBe('update')
    expect(logs[0][2].toString()).toBe('name')
    expect(logs[0][3]).toBe('wohoox')
    expect(store.state.name).toBe('update')
    ;(store.state as any).type = 'onAdd'
    expect(logs.length).toBe(1)
  })

  it('onGet', () => {
    let logs: any[] = []

    const store = createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          onGet(name, value, keys) {
            logs.push([name, value, keys])
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(logs.length).toBe(0)
    expect(store.state.name).toBe('wohoox')
    expect(logs.length).toBe(1)

    expect(logs[0][0]).toBe('default')
    expect(logs[0][1]).toBe('wohoox')
    expect(logs[0][2].toString()).toBe('name')

    console.log(store.state.name)
    expect(logs.length).toBe(2)

    expect(logs[1][0]).toBe('default')
    expect(logs[1][1]).toBe('wohoox')
    expect(logs[1][2].toString()).toBe('name')
  })
})

describe('plugin: ignore to record event', () => {
  it('ignore onAdd', () => {
    let logs: any[] = []

    const store = createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          onAdd(name, value, keys) {
            logs.push([name, value, keys])
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(logs.length).toBe(0)
    ;(store.state as any).type = 'onAdd'
    expect(logs.length).toBe(1)
    expect(logs[0][0]).toBe('default')
    expect(logs[0][1]).toBe('onAdd')
    expect(logs[0][2].toString()).toBe('type')
    ignoreToRecordEvent('onAdd', () => {
      ;(store.state as any).other = 'other'
    })
    expect(logs.length).toBe(1)
    ;(store.state as any).any = 'any'
    expect(logs.length).toBe(2)
  })

  it('ignore onDelete', () => {
    let logs: any[] = []

    const store = createStore({
      initState: {
        name: 'wohoox',
        type: 'onDelete',
        other: 'anything',
      },
      plugins: [
        () => ({
          onDelete(name, keys) {
            logs.push([name, keys])
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(logs.length).toBe(0)
    expect(store.state.name).toBe('wohoox')

    delete (store.state as any).name
    expect(logs.length).toBe(1)
    expect(logs[0][0]).toBe('default')
    expect(logs[0][1].toString()).toBe('name')

    expect(store.state.name).toBeFalsy()

    ignoreToRecordEvent('onDelete', () => {
      delete (store.state as any).type
    })
    expect(logs.length).toBe(1)
    expect(store.state.type).toBeFalsy()

    delete (store.state as any).other
    expect(logs.length).toBe(2)
    expect(logs[1][0]).toBe('default')
    expect(logs[1][1].toString()).toBe('other')

    expect(store.state.other).toBeFalsy()
  })

  it('ignore onChange', () => {
    let logs: any[] = []

    const store = createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          onChange(name, value, keys, _target, oldValue) {
            logs.push([name, value, keys, oldValue])
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(logs.length).toBe(0)
    store.state.name = 'update'
    expect(logs.length).toBe(1)
    expect(logs[0][0]).toBe('default')
    expect(logs[0][1]).toBe('update')
    expect(logs[0][2].toString()).toBe('name')
    expect(logs[0][3]).toBe('wohoox')
    expect(store.state.name).toBe('update')
    ;(store.state as any).type = 'onAdd'
    expect(logs.length).toBe(1)

    ignoreToRecordEvent('onChange', () => {
      store.state.name = 'update2'
    })
    expect(logs.length).toBe(1)

    store.state.name = 'update3'
    expect(logs.length).toBe(2)
    expect(logs[1][0]).toBe('default')
    expect(logs[1][1]).toBe('update3')
    expect(logs[1][2].toString()).toBe('name')
    expect(logs[1][3]).toBe('update2')
  })

  it('ignore onGet', () => {
    let logs: any[] = []

    const store = createStore({
      initState: {
        name: 'wohoox',
      },
      plugins: [
        () => ({
          onGet(name, value, keys) {
            logs.push([name, value, keys])
          },
        }),
        () => ({}),
      ],
      options: { strictMode: false },
    })

    expect(logs.length).toBe(0)
    expect(store.state.name).toBe('wohoox')
    expect(logs.length).toBe(1)

    expect(logs[0][0]).toBe('default')
    expect(logs[0][1]).toBe('wohoox')
    expect(logs[0][2].toString()).toBe('name')

    ignoreToRecordEvent('onGet', () => {
      console.log(store.state.name)
    })
    expect(logs.length).toBe(1)

    console.log(store.state.name)
    expect(logs.length).toBe(2)
    expect(logs[1][0]).toBe('default')
    expect(logs[1][1]).toBe('wohoox')
    expect(logs[1][2].toString()).toBe('name')
  })
})
