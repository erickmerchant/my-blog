import {createDomView, createApp} from '@erickmerchant/framework/main.js'
import {classes} from './css/styles.js'
import {createMainComponent} from './components/main.js'
import {createLayoutComponent} from './components/layout.js'
import {
  contentComponent,
  getSegments,
  dateUtils,
  createPostsModel
} from './common.js'
import {setupApp, getInitialState, getAnchorAttrs} from './frontend.js'

const app = createApp(getInitialState())

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
  dateUtils,
  anchorAttrs
})

const component = createLayoutComponent({
  classes,
  contentComponent,
  mainComponent,
  anchorAttrs
})

const view = createDomView(target, component)

app.render(view)
