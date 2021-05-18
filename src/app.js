import {createApp, createDomView} from '@erickmerchant/framework'

import {createContentView, dateUtils} from './content.js'
import {
  codeClasses,
  dateClasses,
  errorClasses,
  mainClasses,
  paginationClasses,
  postClasses
} from './css/index.js'
import {createModel} from './model.js'
import {setupRouting} from './routing.js'
import {getCodeContentTemplates} from './views/code.js'
import {createDateView} from './views/date.js'
import {createErrorView} from './views/error.js'
import {createMainView} from './views/main.js'
import {createPaginationView} from './views/pagination.js'
import {createPostView, getPostContentTemplates} from './views/post.js'

const app = createApp({route: null, title: ''})

const postsModel = createModel()

const target = document.querySelector('main')

const anchorAttrs = setupRouting({
  app,
  postsModel
})

const dateView = createDateView({
  classes: dateClasses,
  dateUtils
})

const errorView = createErrorView({
  classes: errorClasses
})

const paginationView = createPaginationView({
  classes: paginationClasses,
  anchorAttrs
})

const postView = createPostView({
  classes: postClasses,
  contentView: createContentView({
    templates: {
      ...getPostContentTemplates({classes: postClasses}),
      ...getCodeContentTemplates({classes: codeClasses})
    }
  }),
  dateView,
  paginationView
})

const mainView = createMainView({
  classes: mainClasses,
  postView,
  errorView
})

const view = createDomView(target, mainView)

for (const anchor of document.querySelectorAll('a[href^="/"]')) {
  anchor.addEventListener(
    'click',
    anchorAttrs(anchor.getAttribute('href'))['@click']
  )
}

app.render(view)
