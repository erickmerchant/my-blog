import {createApp, createDomView} from '@erickmerchant/framework'

import {
  createContentView,
  createPostsModel,
  dateUtils,
  getDefaultContentTemplates,
  getRoute
} from './common.js'
import {contentClasses, dateClasses, mainClasses} from './css/styles.js'
import {getAnchorAttrs, getDispatchLocation} from './frontend.js'
import {createDateView} from './views/date.js'
import {createMainView, getMainContentTemplates} from './views/main.js'

const app = createApp({route: null, title: ''})

const listEndpoint = `/content/posts.json`

const postsModel = createPostsModel(listEndpoint)

const dispatchLocation = getDispatchLocation({app, postsModel, getRoute})

window.onpopstate = (e) => {
  dispatchLocation(window.location.pathname, window.location.hash)
}

dispatchLocation(window.location.pathname, window.location.hash)

const target = document.querySelector('#main')

const anchorAttrs = getAnchorAttrs({
  dispatchLocation
})

const dateView = createDateView({
  classes: dateClasses,
  dateUtils
})

const mainView = createMainView({
  classes: mainClasses,
  contentView: createContentView({
    templates: Object.assign(
      getDefaultContentTemplates({classes: contentClasses}),
      getMainContentTemplates({classes: contentClasses})
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
