/* global document */

import framework, {domUpdate} from '@erickmerchant/framework'
import component from './body.mjs'

const update = domUpdate(document.querySelector('body'))
const state = {location: '', title: ''}

framework({state, component, update})
