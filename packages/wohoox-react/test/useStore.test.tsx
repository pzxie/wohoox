import * as React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import { defaultStoreName, storeMap } from 'wohoox'

import { createStore } from '../src/index'
import { useStore } from '../src/hooks/useStore'

const reactLegency = !!process.env.reactLegency

beforeEach(() => {
  cleanup()
  storeMap.clear()
})

class ErrorBoundary extends React.Component<
  {
    onError: (err: any) => any
    children: React.ReactNode
  },
  { hasError: boolean }
> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true }
  }

  componentDidCatch(error) {
    // 你同样可以将错误日志上报给服务器
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>
    }

    return this.props.children
  }
}

it('check empty store: throw err', () => {
  let error: any = null
  const fn = jest.fn()

  function Child() {
    useStore(defaultStoreName)

    fn()

    return <div></div>
  }

  render(
    <ErrorBoundary onError={err => (error = err)}>
      <Child />
    </ErrorBoundary>,
    { legacyRoot: reactLegency },
  )

  expect(fn).not.toHaveBeenCalled()
  expect(error).toBeTruthy()
})

it('check get exist store', () => {
  let outStore: any = null

  createStore({
    name: 'user',
    initState: {
      name: 'user',
    },
  })

  function Child() {
    const store = useStore('user')

    outStore = store

    return <div></div>
  }

  render(<Child />, { legacyRoot: reactLegency })

  expect(outStore).toBeTruthy()
  expect(outStore).toHaveProperty('state')
  expect(outStore).toHaveProperty('actions')
})

it('dynamic store', () => {
  let outStore: any = null
  createStore({
    name: 'user',
    initState: {
      name: 'user',
    },
  })
  createStore({
    initState: {
      name: 'default',
    },
  })

  function Child() {
    const [storeName, setStoreName] = React.useState('default')
    const store = useStore(storeName)

    outStore = store

    return (
      <div>
        <button
          role="user"
          onClick={() => {
            setStoreName('user')
          }}
        >
          change to user
        </button>
        <button
          role="default"
          onClick={() => {
            setStoreName('default')
          }}
        >
          change to default
        </button>
      </div>
    )
  }

  expect(outStore).toBe(null)

  render(<Child />, { legacyRoot: reactLegency })

  expect(outStore).toBeTruthy()
  expect(outStore.state.name).toBe('default')

  const changeToUser = screen.getByRole('user')
  const changeToDefault = screen.getByRole('default')

  fireEvent.click(changeToUser)
  expect(outStore).toBeTruthy()
  expect(outStore.state.name).toBe('user')

  fireEvent.click(changeToDefault)
  expect(outStore).toBeTruthy()
  expect(outStore.state.name).toBe('default')
})
