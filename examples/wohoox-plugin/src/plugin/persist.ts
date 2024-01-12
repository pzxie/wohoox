import type { WohooxPlugin } from 'wohoox'

const persistPlugin: WohooxPlugin<{ version: string }, any> = () => ({
  beforeInit(initState) {
    return {
      initState: {
        ...initState,
        version: JSON.parse(localStorage.getItem('wohoox_version') || '""'),
      },
    }
  },
  onChange(_name, value, keys) {
    if (keys.toString() === 'version')
      localStorage.setItem('wohoox_version', JSON.stringify(value))
  },
})

export default persistPlugin
