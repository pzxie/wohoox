import store from './store'
import './App.css'
import { useState } from 'react'

function App() {
  const [, update] = useState(1)

  return (
    <div className="App">
      <div className="content">
        <div className="logo">
          <a
            href="https://github.com/pzxie/wohoox"
            target="_blank"
            rel="noreferrer"
          >
            <img src="/wohoox.png" className="logo" alt="logo" />
          </a>
        </div>

        <div>
          <strong className="primary">Easy</strong>,{' '}
          <strong className="primary">lightweight</strong> and{' '}
          <strong className="primary">reactive</strong> store
        </div>
        <div>
          <a
            className="link"
            href="https://github.com/pzxie/wohoox"
            target="_blank"
            rel="noreferrer"
          >
            Get started
          </a>
        </div>

        <div className="section">
          <h3>User Store</h3>
          <div className="version">name: {store.user.state.name}</div>
          <button
            className="button"
            onClick={() => {
              store.user.actions.updateName(store.user.state.name + '_up')
              update(Date.now())
            }}
          >
            click to update
          </button>
        </div>
        <div className="section">
          <h3>Department Store</h3>
          <div className="version">
            City: {store.department.state.address.city}
          </div>

          <button
            className="button actions"
            onClick={() => {
              store.department.actions.updateAddress({
                province: 'sc',
                city: store.department.state.address.city + '_up',
              })
              update(Date.now())
            }}
          >
            click to update
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
