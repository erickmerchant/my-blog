import {createDomView, createApp} from '@erickmerchant/framework/main.js'
import {classes} from '/css/styles.js'
import {createComponent, initialState, setupApp} from '/main.js'
import {getSegments, contentComponent} from '/common.js'

const app = createApp(Object.assign({}, initialState))

const key = `/content/posts/index.json`

const promise = window.fetch(key)

const fetch = (url, options) => {
  if (url === key) return promise.then((res) => res.clone())

  return window.fetch(url, options)
}

setupApp(app, fetch, getSegments)

const target = document.querySelector('body')

const component = createComponent(
  app,
  classes,
  fetch,
  getSegments,
  contentComponent
)

const view = createDomView(target, component)

app.render(view)
