import * as React from 'react'
import {
  fireEvent,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import createStore, { useStore, dispatch, dispatchAll } from '../src'

const reactLegency = !!process.env.reactLegency

const symbolStringKey = Symbol('symbol:string')
const symbolObjectKey = Symbol('symbol:object')

function initStore(options?: { strictMode?: boolean }) {
  const defaultInitState = {
    name: 'default',
    details: {
      author: 'default',
    },
  }
  const userInitState = {
    name: 'user',
    details: {
      province: 'sc',
      city: 'cd',
    },
    [symbolStringKey]: 'string',
    [symbolObjectKey]: {
      key: 'symbol',
      value: 'object',
    },
  }
  const departmentInitState = {
    name: 'department',
    details: {
      owner: 'department',
    },
  }

  const defaultStore = createStore({
    initState: defaultInitState,
    actions: {
      nested: {
        updateName(state, name: string) {
          state.name = name
        },
        updateDetailField(state, author) {
          state.details.author = author
        },
        updateDetail(state, details) {
          state.details = details
        },
      },
      updateName(state, name: string) {
        state.name = name
      },
      updateDetailField(state, author) {
        state.details.author = author
      },
      updateDetail(state, details) {
        state.details = details
      },
      dispatch() {},
    },
    options,
  })

  const userStore = createStore({
    name: 'user',
    initState: userInitState,
    actions: {
      nested: {
        updateName(state, name: string) {
          state.name = name
        },
        updateDetailField(state, city) {
          state.details.city = city
        },
        updateDetail(state, details) {
          state.details = details
        },
      },
      updateName(state, name: string) {
        state.name = name
      },
      updateDetailField(state, city) {
        state.details.city = city
      },
      updateDetail(state, details) {
        state.details = { ...state.details, ...details }
      },
      updateSymbolString(state, string) {
        state[symbolStringKey] = string
      },
      updateSymbolObject(state, object) {
        state[symbolObjectKey] = { ...state[symbolObjectKey], ...object }
      },
      dispatch() {},
    },
    options,
  })

  const departmentStore = createStore({
    name: 'department',
    initState: departmentInitState,
    actions: {
      nested: {
        updateName(state, name: string) {
          state.name = name
        },
        updateDetailField(state, owner) {
          state.details.owner = owner
        },
        updateDetail(state, details) {
          state.details = details
        },
      },
      updateName(state, name: string) {
        state.name = name
      },
      updateDetailField(state, owner) {
        state.details.owner = owner
      },
      updateDetail(state, details) {
        state.details = details
      },
      dispatch() {},
    },
    options,
  })

  const store = {
    default: defaultStore,
    user: userStore,
    department: departmentStore,
  }

  const actions = Object.keys(store).reduce((pre, current) => {
    pre[current as 'default'] = store[current as 'default']['actions']
    return pre
  }, {} as any)

  return {
    store,
    actions: actions as any,
    defaultInitState,
    userInitState,
    departmentInitState,
  }
}

afterEach(cleanup)

describe('multi component: get store name', () => {
  it('get store name', () => {
    let { store } = initStore()

    expect(store.default.name).toBe('default')
    expect(store.department.name).toBe('department')
    expect(store.user.name).toBe('user')
  })
})

describe('multi component: getState', () => {
  it('update store name, get state of new store', () => {
    let { userInitState, defaultInitState } = initStore()

    function Child() {
      const [storeName, setStoreName] = React.useState('default')
      let state = useStore(storeName)

      return (
        <div>
          <span>{JSON.stringify(state)}</span>
          <button
            onClick={() => {
              setStoreName('user')
            }}
          >
            get user store
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    expect(container.querySelector('span')?.innerHTML).toBe(
      JSON.stringify(defaultInitState),
    )

    fireEvent.click(container.querySelector('button')!)

    expect(container.querySelector('span')?.innerHTML).toBe(
      JSON.stringify(userInitState),
    )
  })

  it('get hold state by store name and no params', () => {
    let { userInitState, defaultInitState, departmentInitState } = initStore()

    function Child() {
      const defaultState = useStore()
      const userState = useStore('user')
      const departmentState = useStore('department')

      return (
        <div>
          <span role="default">{JSON.stringify(defaultState)}</span>
          <span role="user">{JSON.stringify(userState)}</span>
          <span role="department">{JSON.stringify(departmentState)}</span>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })
    expect(screen.getByRole('default')?.innerHTML).toBe(
      JSON.stringify(defaultInitState),
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(
      JSON.stringify(userInitState),
    )
    expect(screen.getByRole('department')?.innerHTML).toBe(
      JSON.stringify(departmentInitState),
    )
  })

  it('get hold state of store by name and callback', () => {
    let { userInitState, defaultInitState, departmentInitState } = initStore()

    function Child() {
      const defaultState = useStore('default', s => s)
      const userState = useStore('user', s => s)
      const departmentState = useStore('department', s => s)

      return (
        <div>
          <span role="default">{JSON.stringify(defaultState)}</span>
          <span role="user">{JSON.stringify(userState)}</span>
          <span role="department">{JSON.stringify(departmentState)}</span>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })
    expect(screen.getByRole('default')?.innerHTML).toBe(
      JSON.stringify(defaultInitState),
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(
      JSON.stringify(userInitState),
    )
    expect(screen.getByRole('department')?.innerHTML).toBe(
      JSON.stringify(departmentInitState),
    )
  })

  it('get state field(version) of store by name and callback', () => {
    let { userInitState, defaultInitState, departmentInitState } = initStore()

    function Child() {
      const defaultName = useStore('default', s => s.name)
      const userName = useStore('user', s => s.name)
      const departmentName = useStore('department', s => s.name)

      return (
        <div>
          <span role="default">{defaultName}</span>
          <span role="user">{userName}</span>
          <span role="department">{departmentName}</span>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })
    expect(screen.getByRole('default')?.innerHTML).toBe(defaultInitState.name)
    expect(screen.getByRole('user')?.innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('department')?.innerHTML).toBe(
      departmentInitState.name,
    )
  })
})

describe('multi component: update state by actions', () => {
  it('update origin field by action, check component self rerender', () => {
    let { userInitState, defaultInitState, departmentInitState, actions } =
      initStore()

    const originDefaultName = defaultInitState.name
    const originUserName = userInitState.name
    const originDepartmentName = departmentInitState.name

    function Child() {
      const defaultName = useStore('default', s => s.name)
      const userName = useStore('user', s => s.name)
      const departmentName = useStore('department', s => s.name)

      return (
        <div>
          <span role="default">{defaultName}</span>
          <span role="user">{userName}</span>
          <span role="department">{departmentName}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              actions.default.updateName(defaultName + '_1')
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              actions.user.updateName(userName + '_1')
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              actions.department.updateName(departmentName + '_1')
            }}
          >
            update department
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(screen.getByRole('default')?.innerHTML).toBe(originDefaultName)
    expect(screen.getByRole('user')?.innerHTML).toBe(originUserName)
    expect(screen.getByRole('department')?.innerHTML).toBe(originDepartmentName)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(screen.getByRole('default')?.innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(originUserName)
    expect(screen.getByRole('department')?.innerHTML).toBe(originDepartmentName)

    fireEvent.click(screen.getByRole('userBtn'))
    expect(screen.getByRole('default')?.innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(originUserName + '_1')
    expect(screen.getByRole('department')?.innerHTML).toBe(originDepartmentName)

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(screen.getByRole('default')?.innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(originUserName + '_1')
    expect(screen.getByRole('department')?.innerHTML).toBe(
      originDepartmentName + '_1',
    )
  })

  it('update origin field by action, check all relate components rerender', () => {
    let { actions, userInitState, defaultInitState, departmentInitState } =
      initStore()

    function ChildDefault() {
      const name = useStore(s => s.name)

      return (
        <div>
          Child
          <span role="defaultText">{name}</span>
          <button
            role="defaultBtn"
            onClick={() => actions.default.updateName(name + '_child')}
          >
            update default
          </button>
        </div>
      )
    }

    function ChildUser() {
      const name = useStore('user', s => s.name)

      return (
        <div>
          Child
          <span role="userText">{name}</span>
          <button
            role="userBtn"
            onClick={() => actions.user.updateName(name + '_child')}
          >
            update user
          </button>
        </div>
      )
    }

    function Parent({ children }: { children: React.ReactNode }) {
      const defaultName = useStore(s => s.name)
      const userName = useStore('user', s => s.name)
      const departmentName = useStore('department', s => s.name)

      return (
        <div>
          Parent
          <span role="parentDefaultText">{defaultName}</span>
          <span role="parentUserText">{userName}</span>
          <span role="parentDepartmentText">{departmentName}</span>
          <button
            role="parentUpdateUserBtn"
            onClick={() => actions.user.updateName(userName + '_parent')}
          >
            update user from parent
          </button>
          {children}
        </div>
      )
    }

    render(
      <Parent>
        <ChildDefault />
        <ChildUser />
      </Parent>,
      { legacyRoot: reactLegency },
    )

    let childDefaultText = screen.getByRole('defaultText')
    let childUserText = screen.getByRole('userText')
    let parentDefaultText = screen.getByRole('parentDefaultText')
    let parentUserText = screen.getByRole('parentUserText')
    let parentDepartmentText = screen.getByRole('parentDepartmentText')
    let parentUpdateUserBtn = screen.getByRole('parentUpdateUserBtn')!
    let childDefaultBtn = screen.getByRole('defaultBtn')!
    let childUserBtn = screen.getByRole('userBtn')!
    let expectUserName = userInitState.name
    let expectDefaultName = defaultInitState.name

    expect(childDefaultText.innerHTML).toBe(expectDefaultName)
    expect(childUserText.innerHTML).toBe(expectUserName)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultName)
    expect(parentUserText.innerHTML).toBe(expectUserName)
    expect(parentDepartmentText.innerHTML).toBe(departmentInitState.name)

    fireEvent.click(childDefaultBtn)
    expectDefaultName += '_child'
    expect(childDefaultText.innerHTML).toBe(expectDefaultName)
    expect(childUserText.innerHTML).toBe(expectUserName)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultName)
    expect(parentUserText.innerHTML).toBe(expectUserName)
    expect(parentDepartmentText.innerHTML).toBe(departmentInitState.name)

    fireEvent.click(childUserBtn)
    expectUserName += '_child'
    expect(childDefaultText.innerHTML).toBe(expectDefaultName)
    expect(childUserText.innerHTML).toBe(expectUserName)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultName)
    expect(parentUserText.innerHTML).toBe(expectUserName)
    expect(parentDepartmentText.innerHTML).toBe(departmentInitState.name)

    fireEvent.click(parentUpdateUserBtn)
    expectUserName += '_parent'
    expect(childDefaultText.innerHTML).toBe(expectDefaultName)
    expect(childUserText.innerHTML).toBe(expectUserName)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultName)
    expect(parentUserText.innerHTML).toBe(expectUserName)
    expect(parentDepartmentText.innerHTML).toBe(departmentInitState.name)
  })

  it('update reference field address by action, check component self return new reference field during rerender ', () => {
    let { userInitState, defaultInitState, departmentInitState, actions } =
      initStore()

    function Child() {
      const defaultDetail = useStore('default', s => s.details)
      const userDetail = useStore('user', s => s.details)
      const departmentDetail = useStore('department', s => s.details)

      return (
        <div>
          <span role="default">{JSON.stringify(defaultDetail)}</span>
          <span role="user">{JSON.stringify(userDetail)}</span>
          <span role="department">{JSON.stringify(departmentDetail)}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              actions.default.updateDetail({ author: 'updated' })
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              actions.user.updateDetail({
                province: 'updated',
                city: 'updated',
              })
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              actions.department.updateDetail({ owner: 'updated' })
            }}
          >
            update department
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(screen.getByRole('default')?.innerHTML).toBe(
      JSON.stringify(defaultInitState.details),
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(
      JSON.stringify(userInitState.details),
    )
    expect(screen.getByRole('department')?.innerHTML).toBe(
      JSON.stringify(departmentInitState.details),
    )

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(screen.getByRole('default')?.innerHTML).toBe(
      JSON.stringify({ author: 'updated' }),
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(
      JSON.stringify(userInitState.details),
    )
    expect(screen.getByRole('department')?.innerHTML).toBe(
      JSON.stringify(departmentInitState.details),
    )

    fireEvent.click(screen.getByRole('userBtn'))
    expect(screen.getByRole('default')?.innerHTML).toBe(
      JSON.stringify({ author: 'updated' }),
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(
      JSON.stringify({ province: 'updated', city: 'updated' }),
    )
    expect(screen.getByRole('department')?.innerHTML).toBe(
      JSON.stringify(departmentInitState.details),
    )

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(screen.getByRole('default')?.innerHTML).toBe(
      JSON.stringify({ author: 'updated' }),
    )
    expect(screen.getByRole('user')?.innerHTML).toBe(
      JSON.stringify({ province: 'updated', city: 'updated' }),
    )
    expect(screen.getByRole('department')?.innerHTML).toBe(
      JSON.stringify({ owner: 'updated' }),
    )
  })

  it('update reference field address by action, check all relate components return new reference field during rerender ', () => {
    let { actions, userInitState, defaultInitState, departmentInitState } =
      initStore()

    function ChildDefault() {
      const details = useStore(s => s.details)

      return (
        <div>
          Child
          <span role="defaultText">{JSON.stringify(details)}</span>
          <button
            role="defaultBtn"
            onClick={() => actions.default.updateDetail({ author: 'updated' })}
          >
            update default
          </button>
        </div>
      )
    }

    function ChildUser() {
      const details = useStore('user', s => s.details)

      return (
        <div>
          Child
          <span role="userText">{JSON.stringify(details)}</span>
          <button
            role="userBtn"
            onClick={() =>
              actions.user.updateDetail({
                province: 'updated',
                city: 'updated',
              })
            }
          >
            update user
          </button>
        </div>
      )
    }

    function Parent({ children }: { children: React.ReactNode }) {
      const defaultDetails = useStore(s => s.details)
      const userDetails = useStore('user', s => s.details)
      const departmentDetails = useStore('department', s => s.details)

      return (
        <div>
          Parent
          <span role="parentDefaultText">{JSON.stringify(defaultDetails)}</span>
          <span role="parentUserText">{JSON.stringify(userDetails)}</span>
          <span role="parentDepartmentText">
            {JSON.stringify(departmentDetails)}
          </span>
          <button
            role="parentUpdateUserBtn"
            onClick={() =>
              actions.user.updateDetail({
                province: userDetails.province + '_parent',
                city: userDetails.city + '_parent',
              })
            }
          >
            update user from parent
          </button>
          {children}
        </div>
      )
    }

    render(
      <Parent>
        <ChildDefault />
        <ChildUser />
      </Parent>,
      { legacyRoot: reactLegency },
    )

    let childDefaultText = screen.getByRole('defaultText')
    let childUserText = screen.getByRole('userText')
    let parentDefaultText = screen.getByRole('parentDefaultText')
    let parentUserText = screen.getByRole('parentUserText')
    let parentDepartmentText = screen.getByRole('parentDepartmentText')
    let parentUpdateUserBtn = screen.getByRole('parentUpdateUserBtn')!
    let childDefaultBtn = screen.getByRole('defaultBtn')!
    let childUserBtn = screen.getByRole('userBtn')!
    let expectUserDetails = JSON.stringify(userInitState.details)
    let expectDefaultDetails = JSON.stringify(defaultInitState.details)
    let originDepartmentDetails = { ...departmentInitState.details }

    expect(childDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(childUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(parentUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDepartmentText.innerHTML).toBe(
      JSON.stringify(originDepartmentDetails),
    )

    fireEvent.click(childDefaultBtn)
    expectDefaultDetails = JSON.stringify({ author: 'updated' })
    expect(childDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(childUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(parentUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDepartmentText.innerHTML).toBe(
      JSON.stringify(originDepartmentDetails),
    )

    fireEvent.click(childUserBtn)
    expectUserDetails = JSON.stringify({
      province: 'updated',
      city: 'updated',
    })
    expect(childDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(childUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(parentUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDepartmentText.innerHTML).toBe(
      JSON.stringify(originDepartmentDetails),
    )

    fireEvent.click(parentUpdateUserBtn)
    expectUserDetails = JSON.stringify({
      province: 'updated_parent',
      city: 'updated_parent',
    })
    expect(childDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(childUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(parentUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDepartmentText.innerHTML).toBe(
      JSON.stringify(originDepartmentDetails),
    )
  })

  it('update child param of reference field by action, check component self rerender', () => {
    let { userInitState, actions } = initStore()

    function Child() {
      const details = useStore('user', s => s.details)

      return (
        <div>
          <span role="province">{details.province}</span>
          <span role="city">{details.city}</span>
          <button
            onClick={() => {
              actions.user.updateDetailField('chengdu')
            }}
          >
            update city
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    let province = screen.getByRole('province')
    let city = screen.getByRole('city')

    expect(province?.innerHTML).toBe(userInitState.details.province)
    expect(city?.innerHTML).toBe(userInitState.details.city)

    const updateCityBtn = container.querySelector('button')!

    fireEvent.click(updateCityBtn)
    expect(province?.innerHTML).toBe(userInitState.details.province)
    expect(city?.innerHTML).toBe('chengdu')
  })

  it('update child param of reference field by action, check all relate components rerender ', () => {
    let { actions, userInitState, defaultInitState, departmentInitState } =
      initStore()

    function ChildDefault() {
      const details = useStore(s => s.details)

      return (
        <div>
          Child
          <span role="defaultChildText">{details.author}</span>
          <button
            role="defaultChildBtn"
            onClick={() =>
              actions.default.updateDetailField(
                defaultInitState.details.author + '_child',
              )
            }
          >
            update default
          </button>
        </div>
      )
    }

    function ChildUser() {
      const city = useStore('user', s => s.details.city)

      return (
        <div>
          Child
          <span role="userChildText">{city}</span>
          <button
            role="userChildBtn"
            onClick={() =>
              actions.user.updateDetailField(
                userInitState.details.city + '_child',
              )
            }
          >
            update user
          </button>
        </div>
      )
    }

    function Parent() {
      const defaultDetails = useStore(s => s.details.author)
      const userDetails = useStore('user', s => s.details.city)
      const departmentDetails = useStore('department', s => s.details.owner)

      return (
        <div>
          Parent
          <span role="parentDefaultText">{defaultDetails}</span>
          <span role="parentUserText">{userDetails}</span>
          <span role="parentDepartmentText">{departmentDetails}</span>
          <button
            role="parentUpdateUserBtn"
            onClick={() =>
              actions.user.updateDetailField(
                userInitState.details.city + '_parent',
              )
            }
          >
            update user from parent
          </button>
          <ChildDefault />
          <ChildUser />
        </div>
      )
    }

    render(<Parent />, { legacyRoot: reactLegency })

    let childDefaultText = screen.getByRole('defaultChildText')
    let childUserText = screen.getByRole('userChildText')
    let parentDefaultText = screen.getByRole('parentDefaultText')
    let parentUserText = screen.getByRole('parentUserText')
    let parentDepartmentText = screen.getByRole('parentDepartmentText')
    let parentUpdateUserBtn = screen.getByRole('parentUpdateUserBtn')!
    let childDefaultBtn = screen.getByRole('defaultChildBtn')!
    let childUserBtn = screen.getByRole('userChildBtn')!
    let expectUserDetails = userInitState.details.city
    let expectDefaultDetails = defaultInitState.details.author

    expect(childDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(childUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(parentUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDepartmentText.innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(childDefaultBtn)
    expectDefaultDetails += '_child'
    expect(childDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(childUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(parentUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDepartmentText.innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(childUserBtn)
    expectUserDetails += '_child'
    expect(childDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(childUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(parentUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDepartmentText.innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(parentUpdateUserBtn)
    expectUserDetails += '_parent'
    expect(childDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(childUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDefaultText.innerHTML).toBe(expectDefaultDetails)
    expect(parentUserText.innerHTML).toBe(expectUserDetails)
    expect(parentDepartmentText.innerHTML).toBe(
      departmentInitState.details.owner,
    )
  })
})

describe('multi component: update state by state expression + dispatch by actions', () => {
  it('update origin field in strictMode, should throw error', () => {
    let { actions, userInitState, defaultInitState, departmentInitState } =
      initStore()

    let errMessage = ''
    let renderTime = 0
    let errorTime = 0
    function Child() {
      const defaultState = useStore()
      const userState = useStore('user')
      const departmentState = useStore('department')

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.name}</span>
          <span role="userText">{userState.name}</span>
          <span role="departmentText">{departmentState.name}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                actions.default.dispatch()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              try {
                userState.name += '_1'
                actions.user.dispatch()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                actions.department.dispatch()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update department
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(1)
    errMessage = ''

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(2)
    errMessage = ''

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(3)
    errMessage = ''

    expect(errMessage).toBeFalsy()
  })

  it('update origin field', () => {
    let { actions, userInitState, defaultInitState, departmentInitState } =
      initStore({ strictMode: false })

    let errMessage = ''
    let renderTime = 0
    let errorTime = 0

    function Child() {
      const defaultState = useStore()
      const userState = useStore('user')
      const departmentState = useStore('department')

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.name}</span>
          <span role="userText">{userState.name}</span>
          <span role="departmentText">{departmentState.name}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                actions.default.dispatch()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              try {
                userState.name += '_1'
                actions.user.dispatch()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              try {
                departmentState.name += '_1'
                actions.department.dispatch()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update department
          </button>
        </div>
      )
    }

    const originDefaultName = defaultInitState.name
    const originUserName = userInitState.name
    const originDepartmentName = departmentInitState.name

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(2)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName,
    )
    expect(errorTime).toBe(0)

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(3)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName + '_1')
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName,
    )
    expect(errorTime).toBe(0)

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(4)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName + '_1')
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName + '_1',
    )
    expect(errorTime).toBe(0)
  })

  it('update field of reference object', () => {
    let {
      actions,
      userInitState: userState,
      defaultInitState: defaultState,
      departmentInitState: departmentState,
    } = initStore({ strictMode: false })

    let renderTime = 0
    function Child() {
      const defaultState = useStore(s => s.details)
      const userState = useStore('user', s => s.details)
      const departmentState = useStore('department', s => s.details)

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.author}</span>
          <span role="userText">{userState.province}</span>
          <span role="departmentText">{departmentState.owner}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              defaultState.author += '_1'
              actions.default.dispatch()
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              userState.province += '_1'
              actions.user.dispatch()
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              departmentState.owner += '_1'
              actions.department.dispatch()
            }}
          >
            update department
          </button>
        </div>
      )
    }

    const userInitState = JSON.parse(JSON.stringify(userState))
    const defaultInitState = JSON.parse(JSON.stringify(defaultState))
    const departmentInitState = JSON.parse(JSON.stringify(departmentState))

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(2)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province,
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(3)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province + '_1',
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(4)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province + '_1',
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner + '_1',
    )
  })
})

describe('multi component: update state by state expression + dispatch by wohoox dispatch', () => {
  it('update origin field in strictMode, should throw error', () => {
    let { userInitState, defaultInitState, departmentInitState } = initStore()

    let errMessage = ''
    let renderTime = 0
    let errorTime = 0
    function Child() {
      const defaultState = useStore()
      const userState = useStore('user')
      const departmentState = useStore('department')

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.name}</span>
          <span role="userText">{userState.name}</span>
          <span role="departmentText">{departmentState.name}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                dispatch()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              try {
                userState.name += '_1'
                dispatch('user')
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                dispatch('department')
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update department
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(1)
    errMessage = ''

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(2)
    errMessage = ''

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(3)
    errMessage = ''

    expect(errMessage).toBeFalsy()
  })

  it('update origin field', () => {
    let { userInitState, defaultInitState, departmentInitState } = initStore({
      strictMode: false,
    })

    let errMessage = ''
    let renderTime = 0
    let errorTime = 0

    function Child() {
      const defaultState = useStore()
      const userState = useStore('user')
      const departmentState = useStore('department')

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.name}</span>
          <span role="userText">{userState.name}</span>
          <span role="departmentText">{departmentState.name}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                dispatch('default')
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              try {
                userState.name += '_1'
                dispatch('user')
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              try {
                departmentState.name += '_1'
                dispatch('department')
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update department
          </button>
        </div>
      )
    }

    const originDefaultName = defaultInitState.name
    const originUserName = userInitState.name
    const originDepartmentName = departmentInitState.name

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(2)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName,
    )
    expect(errorTime).toBe(0)

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(3)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName + '_1')
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName,
    )
    expect(errorTime).toBe(0)

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(4)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName + '_1')
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName + '_1',
    )
    expect(errorTime).toBe(0)
  })

  it('update field of reference object', () => {
    let {
      userInitState: userState,
      defaultInitState: defaultState,
      departmentInitState: departmentState,
    } = initStore({ strictMode: false })

    let renderTime = 0
    function Child() {
      const defaultState = useStore(s => s.details)
      const userState = useStore('user', s => s.details)
      const departmentState = useStore('department', s => s.details)

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.author}</span>
          <span role="userText">{userState.province}</span>
          <span role="departmentText">{departmentState.owner}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              defaultState.author += '_1'
              dispatch()
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              userState.province += '_1'
              dispatch('user')
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              departmentState.owner += '_1'
              dispatch('department')
            }}
          >
            update department
          </button>
        </div>
      )
    }

    const userInitState = JSON.parse(JSON.stringify(userState))
    const defaultInitState = JSON.parse(JSON.stringify(defaultState))
    const departmentInitState = JSON.parse(JSON.stringify(departmentState))

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(2)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province,
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(3)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province + '_1',
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(4)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province + '_1',
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner + '_1',
    )
  })
})

describe('multi component: update state by state expression + dispatch by wohoox dispatchAll', () => {
  it('update origin field in strictMode, should throw error', () => {
    let { userInitState, defaultInitState, departmentInitState } = initStore()

    let errMessage = ''
    let renderTime = 0
    let errorTime = 0
    function Child() {
      const defaultState = useStore()
      const userState = useStore('user')
      const departmentState = useStore('department')

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.name}</span>
          <span role="userText">{userState.name}</span>
          <span role="departmentText">{departmentState.name}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                dispatchAll()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              try {
                userState.name += '_1'
                dispatchAll()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                dispatchAll()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update department
          </button>
        </div>
      )
    }

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(1)
    errMessage = ''

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(2)
    errMessage = ''

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(1)
    expect(errMessage).toBeInstanceOf(Error)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.name,
    )
    expect(screen.getByRole('userText').innerHTML).toBe(userInitState.name)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.name,
    )
    expect(errorTime).toBe(3)
    errMessage = ''

    expect(errMessage).toBeFalsy()
  })

  it('update origin field', () => {
    let { userInitState, defaultInitState, departmentInitState } = initStore({
      strictMode: false,
    })

    let errMessage = ''
    let renderTime = 0
    let errorTime = 0

    function Child() {
      const defaultState = useStore()
      const userState = useStore('user')
      const departmentState = useStore('department')

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.name}</span>
          <span role="userText">{userState.name}</span>
          <span role="departmentText">{departmentState.name}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              try {
                defaultState.name += '_1'
                dispatchAll()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              try {
                userState.name += '_1'
                dispatchAll()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              try {
                departmentState.name += '_1'
                dispatchAll()
              } catch (e) {
                errMessage = e as string
                errorTime += 1
              }
            }}
          >
            update department
          </button>
        </div>
      )
    }

    const originDefaultName = defaultInitState.name
    const originUserName = userInitState.name
    const originDepartmentName = departmentInitState.name

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(2)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName)
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName,
    )
    expect(errorTime).toBe(0)

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(3)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName + '_1')
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName,
    )
    expect(errorTime).toBe(0)

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(4)
    expect(errMessage).toBeFalsy()
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      originDefaultName + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(originUserName + '_1')
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      originDepartmentName + '_1',
    )
    expect(errorTime).toBe(0)
  })

  it('update field of reference object', () => {
    let {
      userInitState: userState,
      defaultInitState: defaultState,
      departmentInitState: departmentState,
    } = initStore({ strictMode: false })

    let renderTime = 0
    function Child() {
      const defaultState = useStore(s => s.details)
      const userState = useStore('user', s => s.details)
      const departmentState = useStore('department', s => s.details)

      renderTime += 1

      return (
        <div>
          <span role="defaultText">{defaultState.author}</span>
          <span role="userText">{userState.province}</span>
          <span role="departmentText">{departmentState.owner}</span>
          <button
            role="defaultBtn"
            onClick={() => {
              defaultState.author += '_1'
              dispatchAll()
            }}
          >
            update default
          </button>
          <button
            role="userBtn"
            onClick={() => {
              userState.province += '_1'
              dispatchAll()
            }}
          >
            update user
          </button>
          <button
            role="departmentBtn"
            onClick={() => {
              departmentState.owner += '_1'
              dispatchAll()
            }}
          >
            update department
          </button>
        </div>
      )
    }

    const userInitState = JSON.parse(JSON.stringify(userState))
    const defaultInitState = JSON.parse(JSON.stringify(defaultState))
    const departmentInitState = JSON.parse(JSON.stringify(departmentState))

    render(<Child />, { legacyRoot: reactLegency })

    expect(renderTime).toBe(1)

    fireEvent.click(screen.getByRole('defaultBtn'))
    expect(renderTime).toBe(2)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province,
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(screen.getByRole('userBtn'))
    expect(renderTime).toBe(3)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province + '_1',
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner,
    )

    fireEvent.click(screen.getByRole('departmentBtn'))
    expect(renderTime).toBe(4)
    expect(screen.getByRole('defaultText').innerHTML).toBe(
      defaultInitState.details.author + '_1',
    )
    expect(screen.getByRole('userText').innerHTML).toBe(
      userInitState.details.province + '_1',
    )
    expect(screen.getByRole('departmentText').innerHTML).toBe(
      departmentInitState.details.owner + '_1',
    )
  })
})

describe('multi component: render times', () => {
  it('update origin field by 1 action, render 1 time', () => {
    let { actions } = initStore()

    let renderTimes = 0
    function Child() {
      const name = useStore('department', s => s.name)
      renderTimes += 1

      return (
        <div>
          <span>{name}</span>
          <button onClick={() => actions.department.updateName(name + '_1')}>
            update
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    const button = container.querySelector('button')!
    const beforeRenderTimes = renderTimes

    fireEvent.click(button)
    expect(renderTimes).toBe(beforeRenderTimes + 1)

    fireEvent.click(button)
    expect(renderTimes).toBe(beforeRenderTimes + 2)
  })

  it('update multi field by multi actions in the same queue, render 1 time', () => {
    let {
      actions,
      userInitState: userState,
      defaultInitState: defaultState,
    } = initStore()

    let renderTimes = 0
    function Child() {
      const name = useStore(s => s.name)
      const city = useStore('user', s => s.details.city)
      renderTimes += 1

      return (
        <div>
          <span role="name">{name}</span>
          <span role="city">{city}</span>
          <button
            onClick={() => {
              actions.default.updateName(name + '_1')
              actions.user.nested.updateDetailField(city + '_1')
            }}
          >
            update
          </button>
        </div>
      )
    }

    const { container } = render(<Child />, { legacyRoot: reactLegency })

    const userInitState = JSON.parse(JSON.stringify(userState))
    const defaultInitState = JSON.parse(JSON.stringify(defaultState))

    const button = container.querySelector('button')!
    const beforeRenderTimes = renderTimes

    fireEvent.click(button)
    expect(renderTimes).toBe(beforeRenderTimes + 1)
    expect(screen.getByRole('name')?.innerHTML).toBe(
      defaultInitState.name + '_1',
    )
    expect(screen.getByRole('city')?.innerHTML).toBe(
      userInitState.details.city + '_1',
    )

    fireEvent.click(button)
    expect(renderTimes).toBe(beforeRenderTimes + 2)
    expect(screen.getByRole('name')?.innerHTML).toBe(
      defaultInitState.name + '_1_1',
    )
    expect(screen.getByRole('city')?.innerHTML).toBe(
      userInitState.details.city + '_1_1',
    )
  })

  it('update field by actions, relate components rerender, otherwise not rerender', () => {
    let { actions } = initStore()

    let childNameRenderTimes = 0
    let childUserDetailRenderTimes = 0
    let childUserProvinceRenderTimes = 0
    function ChildUserDetail() {
      const details = useStore('user', s => s.details)

      childUserDetailRenderTimes += 1

      return (
        <div>
          <span role="province">{details.province}</span>
          <span role="city">{details.city}</span>
          <button
            role="updateDetailsBtn"
            onClick={() => {
              actions.user.updateDetail({
                province: 'updated',
                city: 'updated',
              })
            }}
          >
            update
          </button>
          <button
            role="updateDetailsCityBtn"
            onClick={() => {
              actions.user.updateDetailField('updated_city')
            }}
          >
            update
          </button>
        </div>
      )
    }

    function ChildUserProvince() {
      const province = useStore('user', s => s.details.province)

      childUserProvinceRenderTimes += 1

      return (
        <div>
          <span role="patch">{province}</span>
        </div>
      )
    }

    function ChildName() {
      const name = useStore(s => s.name)

      childNameRenderTimes += 1

      return (
        <div>
          <span role="name">{name}</span>
          <button
            role="updateDefaultNameBtn"
            onClick={() => {
              actions.default.updateName(name + '_1')
            }}
          >
            update name
          </button>
        </div>
      )
    }

    function Parent() {
      return (
        <div>
          <ChildName />
          <ChildUserProvince />
          <ChildUserDetail />
        </div>
      )
    }

    render(<Parent />, { legacyRoot: reactLegency })

    expect(childNameRenderTimes).toBe(1)
    expect(childUserDetailRenderTimes).toBe(1)
    expect(childUserProvinceRenderTimes).toBe(1)

    const updateDefaultNameBtn = screen.getByRole('updateDefaultNameBtn')
    fireEvent.click(updateDefaultNameBtn)
    expect(childNameRenderTimes).toBe(2)
    expect(childUserDetailRenderTimes).toBe(1)
    expect(childUserProvinceRenderTimes).toBe(1)

    const updateDetailsBtn = screen.getByRole('updateDetailsBtn')
    fireEvent.click(updateDetailsBtn)
    expect(childNameRenderTimes).toBe(2)
    expect(childUserDetailRenderTimes).toBe(2)
    expect(childUserProvinceRenderTimes).toBe(2)

    const updateDetailsCityBtn = screen.getByRole('updateDetailsCityBtn')
    fireEvent.click(updateDetailsCityBtn)
    expect(childNameRenderTimes).toBe(2)
    expect(childUserDetailRenderTimes).toBe(3)
    expect(childUserProvinceRenderTimes).toBe(2)
  })
})

it('update field by multi actions in one queue, components rerender check', async () => {
  let { actions } = initStore()

  const fn = jest.fn()
  let childNameRenderTimes = 0
  let childUserDetailRenderTimes = 0
  let childUserProvinceRenderTimes = 0
  function ChildUserDetail() {
    const details = useStore('user', s => s.details)
    const symbolString = useStore('user', s => s[symbolStringKey])
    const symbolObject = useStore('user', s => s[symbolObjectKey])

    childUserDetailRenderTimes += 1

    return (
      <div>
        <span role="province">{details.province}</span>
        <span role="city">{details.city}</span>
        <span role="symbolString">{symbolString}</span>
        <span role="symbolObject">{JSON.stringify(symbolObject)}</span>
        <button
          role="updateDetailsBtn"
          onClick={() => {
            setTimeout(() => {
              actions.user.updateDetail({
                province: 'updated',
                city: 'updated',
              })
              fn()
              actions.user.updateDetail({
                province: 'updated_2',
                city: 'updated_2',
              })
              fn()
              actions.user.updateDetail({
                province: 'updated_3',
                city: 'updated_3',
              })
              fn()
            }, 5)
          }}
        >
          update
        </button>
        <button
          role="updateDetailsCityBtn"
          onClick={() => {
            actions.user.updateDetailField('updated_city')
            actions.user.updateDetailField('updated_city_2')
            actions.user.updateDetailField('updated_city_3')
          }}
        >
          update
        </button>
        <button
          role="updateSymbolString"
          onClick={() => {
            actions.user.updateSymbolString('updated_symbol_string')
            actions.user.updateSymbolString('updated_symbol_string_2')
            actions.user.updateSymbolString('updated_symbol_string_3')
          }}
        >
          updateSymbolString
        </button>
        <button
          role="updateSymbolObject"
          onClick={() => {
            actions.user.updateSymbolObject({ value: 'updateSymbolObject' })
            actions.user.updateSymbolObject({ value: 'updateSymbolObject_2' })
            actions.user.updateSymbolObject({ value: 'updateSymbolObject_3' })
          }}
        >
          updateSymbolObject
        </button>
      </div>
    )
  }

  function ChildUserProvince() {
    const province = useStore('user', s => s.details.province)
    const symbolString = useStore('user', s => s[symbolStringKey])
    const symbolObject = useStore('user', s => s[symbolObjectKey])

    childUserProvinceRenderTimes += 1

    return (
      <div>
        <span role="patch">{province}</span>
        <span role="patchSymbolString">{symbolString}</span>
        <span role="patchSymbolObject">{symbolObject.value}</span>
      </div>
    )
  }

  function ChildName() {
    const name = useStore(s => s.name)

    childNameRenderTimes += 1

    return (
      <div>
        <span role="name">{name}</span>
        <button
          role="updateDefaultNameBtn"
          onClick={() => {
            actions.default.updateName(name + '_1')
            actions.default.updateName(name + '_2')
            actions.default.updateName(name + '_3')
          }}
        >
          update name
        </button>
      </div>
    )
  }

  function Parent() {
    return (
      <div>
        <ChildName />
        <ChildUserProvince />
        <ChildUserDetail />
      </div>
    )
  }

  render(<Parent />, { legacyRoot: reactLegency })

  const userProvinceText = screen.getByRole('province')
  const userCityText = screen.getByRole('city')
  const userPatchProvinceText = screen.getByRole('patch')
  const defaultNameText = screen.getByRole('name')
  const symbolStringText = screen.getByRole('symbolString')
  const symbolObjectText = screen.getByRole('symbolObject')
  const patchSymbolStringText = screen.getByRole('patchSymbolString')
  const patchSymbolObjectText = screen.getByRole('patchSymbolObject')

  expect(childNameRenderTimes).toBe(1)
  expect(childUserDetailRenderTimes).toBe(1)
  expect(childUserProvinceRenderTimes).toBe(1)
  expect(defaultNameText.innerHTML).toBe('default')
  expect(userCityText.innerHTML).toBe('cd')
  expect(userProvinceText.innerHTML).toBe('sc')
  expect(userPatchProvinceText.innerHTML).toBe('sc')
  expect(symbolStringText.innerHTML).toBe('string')
  expect(symbolObjectText.innerHTML).toBe(
    JSON.stringify({ key: 'symbol', value: 'object' }),
  )
  expect(patchSymbolStringText.innerHTML).toBe('string')
  expect(patchSymbolObjectText.innerHTML).toBe('object')

  const updateDefaultNameBtn = screen.getByRole('updateDefaultNameBtn')
  fireEvent.click(updateDefaultNameBtn)
  expect(childNameRenderTimes).toBe(2)
  expect(childUserDetailRenderTimes).toBe(1)
  expect(childUserProvinceRenderTimes).toBe(1)
  expect(defaultNameText.innerHTML).toBe('default_3')
  expect(userCityText.innerHTML).toBe('cd')
  expect(userProvinceText.innerHTML).toBe('sc')
  expect(userPatchProvinceText.innerHTML).toBe('sc')
  expect(symbolStringText.innerHTML).toBe('string')
  expect(symbolObjectText.innerHTML).toBe(
    JSON.stringify({ key: 'symbol', value: 'object' }),
  )
  expect(patchSymbolStringText.innerHTML).toBe('string')
  expect(patchSymbolObjectText.innerHTML).toBe('object')

  const updateDetailsBtn = screen.getByRole('updateDetailsBtn')
  fireEvent.click(updateDetailsBtn)
  await waitFor(() => expect(fn).toHaveBeenCalledTimes(3))
  expect(childNameRenderTimes).toBe(2)
  expect(childUserDetailRenderTimes).toBe(2)
  expect(childUserProvinceRenderTimes).toBe(2)
  expect(defaultNameText.innerHTML).toBe('default_3')
  expect(userCityText.innerHTML).toBe('updated_3')
  expect(userProvinceText.innerHTML).toBe('updated_3')
  expect(userPatchProvinceText.innerHTML).toBe('updated_3')
  expect(symbolStringText.innerHTML).toBe('string')
  expect(symbolObjectText.innerHTML).toBe(
    JSON.stringify({ key: 'symbol', value: 'object' }),
  )
  expect(patchSymbolStringText.innerHTML).toBe('string')
  expect(patchSymbolObjectText.innerHTML).toBe('object')

  const updateDetailsCityBtn = screen.getByRole('updateDetailsCityBtn')
  fireEvent.click(updateDetailsCityBtn)
  expect(childNameRenderTimes).toBe(2)
  expect(childUserDetailRenderTimes).toBe(3)
  expect(childUserProvinceRenderTimes).toBe(2)
  expect(defaultNameText.innerHTML).toBe('default_3')
  expect(userCityText.innerHTML).toBe('updated_city_3')
  expect(userProvinceText.innerHTML).toBe('updated_3')
  expect(userPatchProvinceText.innerHTML).toBe('updated_3')
  expect(symbolStringText.innerHTML).toBe('string')
  expect(symbolObjectText.innerHTML).toBe(
    JSON.stringify({ key: 'symbol', value: 'object' }),
  )
  expect(patchSymbolStringText.innerHTML).toBe('string')
  expect(patchSymbolObjectText.innerHTML).toBe('object')

  const updateSymbolStringBtn = screen.getByRole('updateSymbolString')
  fireEvent.click(updateSymbolStringBtn)
  expect(childNameRenderTimes).toBe(2)
  expect(childUserDetailRenderTimes).toBe(4)
  expect(childUserProvinceRenderTimes).toBe(3)
  expect(defaultNameText.innerHTML).toBe('default_3')
  expect(userCityText.innerHTML).toBe('updated_city_3')
  expect(userProvinceText.innerHTML).toBe('updated_3')
  expect(userPatchProvinceText.innerHTML).toBe('updated_3')
  expect(symbolStringText.innerHTML).toBe('updated_symbol_string_3')
  expect(symbolObjectText.innerHTML).toBe(
    JSON.stringify({ key: 'symbol', value: 'object' }),
  )
  expect(patchSymbolStringText.innerHTML).toBe('updated_symbol_string_3')
  expect(patchSymbolObjectText.innerHTML).toBe('object')

  const updateSymbolObjectBtn = screen.getByRole('updateSymbolObject')
  fireEvent.click(updateSymbolObjectBtn)
  expect(childNameRenderTimes).toBe(2)
  expect(childUserDetailRenderTimes).toBe(5)
  expect(childUserProvinceRenderTimes).toBe(4)
  expect(defaultNameText.innerHTML).toBe('default_3')
  expect(userCityText.innerHTML).toBe('updated_city_3')
  expect(userProvinceText.innerHTML).toBe('updated_3')
  expect(userPatchProvinceText.innerHTML).toBe('updated_3')
  expect(symbolStringText.innerHTML).toBe('updated_symbol_string_3')
  expect(symbolObjectText.innerHTML).toBe(
    JSON.stringify({ key: 'symbol', value: 'updateSymbolObject_3' }),
  )
  expect(patchSymbolStringText.innerHTML).toBe('updated_symbol_string_3')
  expect(patchSymbolObjectText.innerHTML).toBe('updateSymbolObject_3')
})
