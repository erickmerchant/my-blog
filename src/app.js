import {createApp, createDomView, html} from '@erickmerchant/framework'

import {createContentView, dateUtils} from './content.js'
import {
  aboutClasses,
  codeClasses,
  dateClasses,
  layoutClasses,
  mainClasses,
  paginationClasses
} from './css/index.js'
import {createModel} from './model.js'
import {setupRouting} from './routing.js'
import {createAboutView, getAboutContentTemplates} from './views/about.js'
import {getCodeContentTemplates} from './views/code.js'
import {createDateView} from './views/date.js'
import {createLayoutView} from './views/layout.js'
import {createMainView, getMainContentTemplates} from './views/main.js'
import {createPaginationView} from './views/pagination.js'

html.dev = import.meta.env.DEV

const app = createApp({isLoading: true})

const target = document.querySelector(import.meta.env.DEV ? 'body' : 'main')

export const __update = () => {
  const postsModel = createModel()

  const anchorAttrs = setupRouting({app, postsModel})

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

  let view

  if (!import.meta.env.DEV) {
    view = createDomView(target, mainView)

    for (const anchor of document.querySelectorAll('a[href^="/"]')) {
      anchor.addEventListener(
        'click',
        anchorAttrs(anchor.getAttribute('href'))['@click']
      )
    }
  } else {
    const aboutView = createAboutView({
      classes: aboutClasses,
      contentView: createContentView({
        templates: getAboutContentTemplates({classes: aboutClasses})
      })
    })

    const layoutView = createLayoutView({
      classes: layoutClasses,
      aboutView,
      mainView,
      anchorAttrs
    })

    view = createDomView(target, layoutView)
  }

  app.render(view)
}

__update()
