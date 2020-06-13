import {createDomView, createApp} from '@erickmerchant/framework/main.mjs'
import {classes} from '/css/styles.mjs'
import {createComponent, initialState, setupApp} from '/main.mjs'
import {getSegments, contentComponent} from '/common.mjs'

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
