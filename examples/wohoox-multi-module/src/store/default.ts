import { createStore } from 'wohoox'

export default createStore({
  name: 'department',
  initState: {
    name: 'developer',
    address: {
      province: 'sc',
      city: 'cd',
    },
  },
  actions: {
    updateAddress(state, address: typeof state.address) {
      state.address = address
    },
  },
})
