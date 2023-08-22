import { createStore } from 'wohoox-react'

export default createStore({
  name: 'user',
  initState: {
    time: new Date().toLocaleString(),
  },
  actions: {
    updateBirthday(state, time: string) {
      state.time = time
    },
  },
})
