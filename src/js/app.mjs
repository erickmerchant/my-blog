import framework, {domUpdate} from '@erickmerchant/framework'
import component from './body.mjs'

const target = document.querySelector('body')

const update = domUpdate(target)

const state = {location: '', title: ''}

framework({state, component, update})
