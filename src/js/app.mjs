import framework, {domUpdate} from '@erickmerchant/framework'
import component from './body.mjs'
import {dispatchLocation} from './store.mjs'

const target = document.querySelector('body')

const update = domUpdate(target)

const state = {location: '', title: ''}

const commit = framework({state, component, update})

window.onpopstate = () => {
  dispatchLocation(commit, document.location.pathname)
}

dispatchLocation(commit, document.location.pathname)
