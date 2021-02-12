import {createDomView, createApp} from '@erickmerchant/framework/main.js'
import {mainClasses} from './css/styles.js'
import {createMainComponent} from './components/main.js'
import {
  createContentComponent,
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

const listEndpoint = `/content/posts.json`

const postsModel = createPostsModel(listEndpoint)

const dispatchLocation = getDispatchLocation({app, postsModel, getSegments})

setupApp({dispatchLocation})

const target = document.querySelector('#main')

const anchorAttrs = getAnchorAttrs({
  dispatchLocation
})

const mainComponent = createMainComponent({
  classes: mainClasses,
  createContentComponent,
  dateUtils,
  anchorAttrs
})

const view = createDomView(target, mainComponent)

for (const anchor of document.querySelectorAll('a[href^="/"]')) {
  anchor.addEventListener(
    'click',
    anchorAttrs(anchor.getAttribute('href')).onclick
  )
}

app.render(view)
