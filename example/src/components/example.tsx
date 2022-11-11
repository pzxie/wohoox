import { useStore } from '../store'

export default function Example () {
  // Default to get 'default' store and return the hole state
  // const userState = useStore()

  console.log('render example')

  const state = useStore()

  return <div>
    <h2>Single store</h2>
    <div>{state.version}</div>

    <button onClick={() => {state.version += "_1"; }}>click to update version</button>
  </div>
}
