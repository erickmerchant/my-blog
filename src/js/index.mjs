import framework, { update } from '@erickmerchant/framework'
import store from './store.mjs'
import component from './body.mjs'
import history from './history.mjs'

const dispatch = framework({ store, component, update: update(document.querySelector('body')) })

history.listen((location) => {
  dispatch(location.pathname)
})

dispatch(history.location.pathname)
