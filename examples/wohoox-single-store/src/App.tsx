import store, { actions } from './store'
import './App.css'
import { useState } from 'react'

function App() {
  const [_, update] = useState(1)

  return (
    <div className="App">
      <div className="App-header">
        <div className="App-logo">
          <img src="/wohoox.png" className="App-logo" alt="logo" />
          <span className="version-tag">{store.state.version}</span>
        </div>

        <div>
          <strong className="primary">Easy</strong>,{' '}
          <strong className="primary">lightweight</strong> and{' '}
          <strong className="primary">reactive</strong> store
        </div>

        <div>
          <span className="version">Version: {store.state.version}</span>
          <button
            onClick={() => {
              actions.updateVersion(`1.${Math.floor(Math.random() * 10)}`)
            }}
          >
            click to update
          </button>
        </div>
        <ul>
          {[...store.state.set.values()].map(item => (
            <li>{item}</li>
          ))}
        </ul>
        <button
          onClick={() => {
            actions.addItem(Math.floor(Math.random() * 10))
            update(Math.random())
          }}
        >
          click to add
        </button>
        <button
          onClick={() => {
            actions.empty()
            update(Math.random())
          }}
        >
          empty
        </button>
      </div>
    </div>
  )
}

export default App
