import {createDomView, createApp} from '@erickmerchant/framework/main.js'
import {mainClasses as classes} from './css/styles.js'
import {createMainView, getMainContentTemplates} from './views/main.js'
import {createDateView} from './views/date.js'
import {
  createContentView,
  getDefaultContentTemplates,
  getRoute,
  dateUtils,
  createPostsModel
} from './common.js'
import {getAnchorAttrs, getDispatchLocation} from './frontend.js'

const app = createApp({route: {key: 'error', params: []}, title: ''})

const listEndpoint = `/content/posts.json`

const postsModel = createPostsModel(listEndpoint)

const dispatchLocation = getDispatchLocation({app, postsModel, getRoute})

window.onpopstate = (e) => {
  dispatchLocation(window.location.pathname)
}

dispatchLocation(window.location.pathname, false)

const target = document.querySelector('#main')

const anchorAttrs = getAnchorAttrs({
  dispatchLocation
})

const dateView = createDateView({
  classes,
  dateUtils
})

const mainView = createMainView({
  classes,
  contentView: createContentView({
    templates: Object.assign(
      getDefaultContentTemplates({classes}),
      getMainContentTemplates({classes})
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
