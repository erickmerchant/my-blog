/* global document, window */

import framework, {update} from '@erickmerchant/framework'
import store from './store.mjs'
import component from './body.mjs'

const dispatch = framework({store, component, update: update(document.querySelector('body'))})

window.onpopstate = () => {
  dispatch(document.location.pathname)
}

dispatch(document.location.pathname)
