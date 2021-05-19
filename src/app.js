import {createApp, createDomView} from '@erickmerchant/framework'

import {createContentView, dateUtils} from './content.js'
import {
  codeClasses,
  dateClasses,
  mainClasses,
  paginationClasses
} from './css/index.js'
import {createModel} from './model.js'
import {setupRouting} from './routing.js'
import {getCodeContentTemplates} from './views/code.js'
import {createDateView} from './views/date.js'
import {createMainView, getMainContentTemplates} from './views/main.js'
import {createPaginationView} from './views/pagination.js'

const app = createApp({isLoading: true})

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

const paginationView = createPaginationView({
  classes: paginationClasses,
  anchorAttrs
})

const mainView = createMainView({
  classes: mainClasses,
  contentView: createContentView({
    templates: {
      ...getMainContentTemplates({classes: mainClasses}),
      ...getCodeContentTemplates({classes: codeClasses})
    }
  }),
  dateView,
  paginationView
})

const view = createDomView(target, mainView)

for (const anchor of document.querySelectorAll('a[href^="/"]')) {
  anchor.addEventListener(
    'click',
    anchorAttrs(anchor.getAttribute('href'))['@click']
  )
}

app.render(view)
