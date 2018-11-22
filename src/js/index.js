import framework from '@erickmerchant/framework'
import update from '@erickmerchant/framework/update'
import store from './store.js'
import component from './body.js'
import history from './history.js'

const dispatch = framework({ store, component, update: update(document.querySelector('body')) })

history.listen((location) => {
  dispatch(location.pathname)
})

dispatch(history.location.pathname)
