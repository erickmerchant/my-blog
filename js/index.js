const framework = require('@erickmerchant/framework')
const update = require('@erickmerchant/framework/update')(document.querySelector('body'))
const store = require('./store.js')
const component = require('./body.js')
const history = require('./history.js')

const dispatch = framework({ store, component, update })

history.listen((location) => {
  dispatch(location.pathname)
})

dispatch(history.location.pathname)
