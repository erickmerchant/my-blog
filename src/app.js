import {createDomView, createApp} from '@erickmerchant/framework/main.js'
import {mainClasses} from './css/styles.js'
import {createMainView, getMainContentTemplates} from './views/main.js'
import {createDateView} from './views/date.js'
import {
  createContentView,
  getDefaultContentTemplates,
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

const dateView = createDateView({
  classes: mainClasses,
  dateUtils
})

const mainView = createMainView({
  classes: mainClasses,
  contentView: createContentView({
    templates: Object.assign(
      getDefaultContentTemplates({classes: mainClasses}),
      getMainContentTemplates({classes: mainClasses})
    )
  }),
  dateView,
  anchorAttrs
})

const view = createDomView(target, mainView)

for (const anchor of document.querySelectorAll('a[href^="/"]')) {
  anchor.addEventListener(
    'click',
    anchorAttrs(anchor.getAttribute('href')).onclick
  )
}

app.render(view)
