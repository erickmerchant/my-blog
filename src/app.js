import {createDomView, createApp} from '@erickmerchant/framework/main.js'
import {layoutClasses, aboutClasses, mainClasses} from './css/styles.js'
import {createMainComponent} from './components/main.js'
import {createLayoutComponent} from './components/layout.js'
import {createAboutComponent} from './components/about.js'
import {
  contentComponent,
  getSegments,
  dateUtils,
  createPostsModel
} from './common.js'
import {
  setupApp,
  getInitialState,
  getAnchorAttrs,
  getDispatchLocation
} from './frontend.js'

const app = createApp(getInitialState())

const key = `/content/posts/index.json`

const promise = window.fetch(key)

const fetch = (url, options) => {
  if (url === key) return promise.then((res) => res.clone())

  return window.fetch(url, options)
}

const postModel = createPostsModel(fetch)

const dispatchLocation = getDispatchLocation({app, postModel, getSegments})

setupApp({dispatchLocation})

const target = document.querySelector('body')

const anchorAttrs = getAnchorAttrs({
  dispatchLocation
})

const mainComponent = createMainComponent({
  classes: mainClasses,
  contentComponent,
  dateUtils,
  anchorAttrs
})

const aboutComponent = createAboutComponent({
  classes: aboutClasses,
  contentComponent
})

const component = createLayoutComponent({
  classes: layoutClasses,
  aboutComponent,
  mainComponent,
  anchorAttrs
})

const view = createDomView(target, component)

app.render(view)
