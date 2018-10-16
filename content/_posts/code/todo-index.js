const framework = require('@erickmerchant/framework')
const store = require('./store')
const component = require('./component')
const diff = require('nanomorph')
const target = document.querySelector('main')

/* framework is called with a settings object. Four things are required. store provides our state. component provides our dom element. diff provides a means to apply changes to that element. target is the element on the page that will get replaced with what the component returns. framework returns a function that's called with a callback that sets up a hash router.
*/
framework({ target, store, component, diff })((dispatch) => {
  window.onhashchange = () => {
    dispatch('set-hash', { hash: window.location.hash })
  }

  dispatch('set-hash', { hash: window.location.hash })
})
