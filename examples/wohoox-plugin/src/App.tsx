import store, { actions } from './store'
import './App.css'
import { useState } from 'react'

function App() {
  const [, update] = useState(1)

  const updateUi = () => {
    update(Math.random())
  }

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
          <h3>Plugin Persist</h3>
          <div className="desc">Custom plugin for wohoox</div>
          <div className="version">Version: {store.state.version}</div>
          <button
            className="button"
            onClick={() => {
              actions.updateVersion(`1.${Math.floor(Math.random() * 10)}`)
              updateUi()
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
