/* global document */

import framework, {domUpdate} from '@erickmerchant/framework'
import onappend from '@erickmerchant/onappend'
import component from './body.mjs'

const target = document.querySelector('body')

onappend(target)

const update = domUpdate(target)

const state = {location: '', title: ''}

framework({state, component, update})
