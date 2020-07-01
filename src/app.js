import {createDomView, createApp} from '@erickmerchant/framework/main.js'
import {classes} from '/css/styles.js'
import {createComponent, initialState, setupApp} from '/main.js'
import * as common from '/common.js'

const app = createApp(Object.assign({}, initialState))

const key = `/content/posts/index.json`

const promise = window.fetch(key)

const fetch = (url, options) => {
  if (url === key) return promise.then((res) => res.clone())

  return window.fetch(url, options)
}

setupApp(app, fetch, common)

const target = document.querySelector('body')

const component = createComponent(app, classes, fetch, common)

const view = createDomView(target, component)

app.render(view)
