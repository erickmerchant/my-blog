import {createApp, createDomView} from '@erickmerchant/framework'

import {
  createContentView,
  dateUtils,
  getDefaultContentTemplates
} from './content.js'
import {contentClasses, dateClasses, mainClasses} from './css/styles.js'
import {createModel} from './model.js'
import {setupRouting} from './routing.js'
import {createDateView} from './views/date.js'
import {createMainView, getMainContentTemplates} from './views/main.js'

const app = createApp({route: null, title: '', wrapCode: true})

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

const mainView = createMainView({
  classes: mainClasses,
  contentView: createContentView({
    templates: Object.assign(
      getDefaultContentTemplates({classes: contentClasses}),
      getMainContentTemplates({app, classes: contentClasses})
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
