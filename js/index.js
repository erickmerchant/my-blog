const framework = require('@erickmerchant/framework')
const diff = require('nanomorph')
const store = require('./store.js')
const component = require('./body.js')
const history = require('./history.js')
const target = document.querySelector('body')

framework({ target, store, component, diff })((dispatch) => {
  history.listen((location) => {
    dispatch(location.pathname)
  })

  dispatch(history.location.pathname)
})
