import {createDomView, createApp} from '@erickmerchant/framework/main.js'
import {classes} from './css/styles.js'
import {createMainComponent} from './main.js'
import {createComponent} from './component.js'
import {
  contentComponent,
  getSegments,
  prettyDate,
  createPostsModel
} from './common.js'
import {setupApp, initialState, getAnchorAttrs} from './frontend.js'

const app = createApp(Object.assign({}, initialState))

const key = `/content/posts/index.json`

const promise = window.fetch(key)

const fetch = (url, options) => {
  if (url === key) return promise.then((res) => res.clone())

  return window.fetch(url, options)
}

const postModel = createPostsModel(fetch)

setupApp({app, postModel, getSegments})

const target = document.querySelector('body')

const anchorAttrs = getAnchorAttrs({
  app,
  postModel,
  getSegments
})

const mainComponent = createMainComponent({
  classes,
  contentComponent,
  prettyDate,
  anchorAttrs
})

const component = createComponent({
  classes,
  contentComponent,
  mainComponent,
  anchorAttrs
})

const view = createDomView(target, component)

app.render(view)
