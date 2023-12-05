import { createStore, clearStore } from '../src'
import type { WohooxPlugin } from '../src'

function initStore(
  storeName?: string,
  options?: { strictMode?: boolean },
  plugins?: WohooxPlugin[],
) {
  const initState = {
    type: {
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
    plugins,
    options: options || { strictMode: false },
  })

  return {
    initState,
    store,
  }
}

beforeEach(() => {
  clearStore()
})

describe('array item', () => {
  it('value modify: original item', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const initData = JSON.parse(JSON.stringify(initState.type.arrayOriginal))

    function updateString() {
      state.type.arrayOriginal[0] += '_string'
      initData[0] += '_string'
      expect(state.type.arrayOriginal[0]).toBe(initData[0])
      expect(state.type.arrayOriginal[1]).toBe(initData[1])
      expect(state.type.arrayOriginal[2]).toBe(initData[2])
    }

    function updateBoolean() {
      state.type.arrayOriginal[1] = !state.type.arrayOriginal[1]
      initData[1] = !initData[1]
      expect(state.type.arrayOriginal[0]).toBe(initData[0])
      expect(state.type.arrayOriginal[1]).toBe(initData[1])
      expect(state.type.arrayOriginal[2]).toBe(initData[2])
    }

    function updateNumber() {
      state.type.arrayOriginal[2] = (state.type.arrayOriginal[2] as number) + 2
      initData[2] += 2
      expect(state.type.arrayOriginal[0]).toBe(initData[0])
      expect(state.type.arrayOriginal[1]).toBe(initData[1])
      expect(state.type.arrayOriginal[2]).toBe(initData[2])
    }

    function updateArray() {
      state.type.arrayOriginal = ['3', true, 3]
      expect(state.type.arrayOriginal[0]).toBe('3')
      expect(state.type.arrayOriginal[1]).toBe(true)
      expect(state.type.arrayOriginal[2]).toBe(3)
    }

    updateString()
    updateBoolean()
    updateNumber()
    updateArray()
  })

  it('value modify: reference item', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const initData = JSON.parse(JSON.stringify(initState.type.arrayReference))

    function updateObjectReference() {
      state.type.arrayReference[0] = {
        ...state.type.arrayReference[0],
        name: state.type.arrayReference[0].name + '_object',
      }
      initData[0].name += '_object'

      expect(state.type.arrayReference[0].name).toBe(initData[0].name)
      expect(state.type.arrayReference[1][1]).toBe(initData[1][1])
    }

    function updateObjectField() {
      state.type.arrayReference[0].name += '_field'
      initData[0].name += '_field'

      expect(state.type.arrayReference[0].name).toBe(initData[0].name)
    }

    function updateArrayReference() {
      const tempState = state.type.arrayReference
      tempState[1] = [
        tempState[1][0] + 1,
        tempState[1][1] + 2,
        tempState[1][2] + 3,
      ]

      initData[1] = [initData[1][0] + 1, initData[1][1] + 2, initData[1][2] + 3]

      expect(state.type.arrayReference[1][0]).toBe(initData[1][0])
      expect(state.type.arrayReference[1][1]).toBe(initData[1][1])
      expect(state.type.arrayReference[1][2]).toBe(initData[1][2])
    }

    function updateArrayItem() {
      state.type.arrayReference[1][1] += 3
      initData[1][1] += 3

      expect(state.type.arrayReference[1][1]).toBe(initData[1][1])
    }

    function updateArrayLengthToZero() {
      // @ts-ignore
      state.type.arrayReference.length = 0

      expect(state.type.arrayReference[0]).toBeFalsy()
    }

    function updateArrayLengthToTwo() {
      state.type.arrayReference.length = 2

      expect(state.type.arrayReference[0]).toBeFalsy()
      expect(state.type.arrayReference[1]).toBeFalsy()
    }

    function updateArraySelf() {
      // @ts-ignore
      state.type.arrayReference = [{}, []]

      expect(state.type.arrayReference.length).toBe(2)
    }

    updateObjectReference()
    updateObjectField()
    updateArrayReference()
    updateArrayItem()
    updateArrayLengthToZero()
    updateArrayLengthToTwo()
    updateArraySelf()
  })

  it('methods call', () => {
    const {
      initState,
      store: { state },
    } = initStore()

    const initData = JSON.parse(JSON.stringify(initState.type.arrayOriginal))

    function push() {
      state.type.arrayOriginal.push(2)
      initData.push(2)

      expect(state.type.arrayOriginal.length).toBe(initData.length)
    }

    function unshift() {
      state.type.arrayOriginal.unshift(5)
      initData.unshift(5)

      expect(state.type.arrayOriginal.length).toBe(initData.length)
    }

    function shift() {
      state.type.arrayOriginal.shift()
      initData.shift()

      expect(state.type.arrayOriginal.length).toBe(initData.length)
    }

    function reverse() {
      state.type.arrayOriginal.reverse()
      initData.reverse()

      expect(state.type.arrayOriginal.length).toBe(initData.length)
      expect(JSON.stringify(state.type.arrayOriginal)).toBe(
        JSON.stringify(initData),
      )
    }

    function sort() {
      state.type.arrayOriginal.sort()
      initData.sort()

      expect(state.type.arrayOriginal.length).toBe(initData.length)
      expect(JSON.stringify(state.type.arrayOriginal)).toBe(
        JSON.stringify(initData),
      )
    }

    function spliceDelete() {
      state.type.arrayOriginal.splice(1, 1)
      initData.splice(1, 1)

      expect(state.type.arrayOriginal.length).toBe(initData.length)
      expect(JSON.stringify(state.type.arrayOriginal)).toBe(
        JSON.stringify(initData),
      )
    }

    function spliceInsert() {
      state.type.arrayOriginal.splice(1, 0, 'splice')
      initData.splice(1, 0, 'splice')

      expect(state.type.arrayOriginal.length).toBe(initData.length)
      expect(JSON.stringify(state.type.arrayOriginal)).toBe(
        JSON.stringify(initData),
      )
    }

    expect(state.type.arrayOriginal.length).toBe(3)
    expect(state.type.arrayOriginal[0]).toBe(initData[0])
    expect(state.type.arrayOriginal[1]).toBe(initData[1])
    expect(state.type.arrayOriginal[2]).toBe(initData[2])

    push()
    unshift()
    shift()
    reverse()
    sort()
    spliceDelete()
    spliceInsert()
  })
})

describe('array length', () => {
  it('methods called, length changed and length callback called', () => {
    let originalLength = 0
    let lengthCallbackTriggerTimes = 0
    let lengthCallbackRecord = 0
    const {
      store: { state },
    } = initStore('default', undefined, [
      {
        onChange(_storeName, _value, keys, target) {
          if (keys[keys.length - 1] === 'length' && Array.isArray(target))
            lengthCallbackTriggerTimes++
        },
      },
    ])

    originalLength = state.type.arrayOriginal.length

    function push() {
      state.type.arrayOriginal.push(2)
      originalLength++
      lengthCallbackRecord++

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    function unshift() {
      state.type.arrayOriginal.unshift(5)
      originalLength++
      lengthCallbackRecord++

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    function shift() {
      state.type.arrayOriginal.shift()
      originalLength--
      lengthCallbackRecord++

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    function reverse() {
      state.type.arrayOriginal.reverse()

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    function sort() {
      state.type.arrayOriginal.sort()

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    function spliceDelete() {
      state.type.arrayOriginal.splice(1, 1)

      originalLength--
      lengthCallbackRecord++

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    function spliceInsert() {
      state.type.arrayOriginal.splice(1, 0, 'splice')
      originalLength++
      lengthCallbackRecord++

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    expect(state.type.arrayOriginal.length).toBe(originalLength)
    expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)

    push()
    unshift()
    shift()
    reverse()
    sort()
    spliceDelete()
    spliceInsert()
  })

  it('set item manually, length changed and length callback called', () => {
    let originalLength = 0
    let lengthCallbackTriggerTimes = 0
    let lengthCallbackRecord = 0
    const {
      store: { state },
    } = initStore('default', undefined, [
      {
        onChange(_storeName, _value, keys, target) {
          if (keys[keys.length - 1] === 'length' && Array.isArray(target))
            lengthCallbackTriggerTimes++
        },
      },
    ])

    originalLength = state.type.arrayOriginal.length

    function changeExist() {
      state.type.arrayOriginal[0] = 'update_0'

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    function addNewItem() {
      state.type.arrayOriginal[6] = 'add_6'

      originalLength = 7
      lengthCallbackRecord++

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    function clear() {
      state.type.arrayOriginal.length = 0

      originalLength = 0
      lengthCallbackRecord++

      expect(state.type.arrayOriginal.length).toBe(originalLength)
      expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)
    }

    expect(state.type.arrayOriginal.length).toBe(originalLength)
    expect(lengthCallbackTriggerTimes).toBe(lengthCallbackRecord)

    changeExist()
    addNewItem()
    clear()
  })
})
