
const framework = require('@erickmerchant/framework')
const diff = require('nanomorph')
const store = require('./store.js')
const component = require('./component.js')
const history = require('./history.js')
const target = document.querySelector('html')

framework({target, store, component, diff})(function (dispatch) {
  history.listen(function (location) {
    dispatch('location', location.pathname)
  })

  dispatch('location', history.location.pathname)
})
