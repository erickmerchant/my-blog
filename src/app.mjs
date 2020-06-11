import {createDomView, createApp} from '@erickmerchant/framework/main.mjs'
import {classes} from '/css/styles.mjs'
import {createComponent, initialState, setupApp} from '/main.mjs'
import {getSegments, contentComponent} from '/common.mjs'

const app = createApp(Object.assign({}, initialState))

setupApp(app, getSegments)

const target = document.querySelector('body')

const component = createComponent(app, classes, getSegments, contentComponent)

const view = createDomView(target, component)

app.render(view)
