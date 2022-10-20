import { actions, useStore } from '../store'

export default function Example () {
  // Default to get 'default' store and return the hole state
  // const userState = useStore()

  const version = useStore(state => state.version)

  return <div>
    <h2>Version</h2>
    <div>{version}</div>

    <button onClick={() => {actions.updateVersion(version + '_1')}}>click to update version</button>
  </div>
}
