import {createApp, createDOMView} from '@erickmerchant/framework'

import {
  aboutClasses,
  codeClasses,
  dateClasses,
  iconsClasses,
  layoutClasses,
  mainClasses,
  paginationClasses
} from './asset/styles/index.js'
import {createContentView, dateUtils} from './content.js'
import {createModel} from './model.js'
import {setupRouting} from './routing.js'
import {createAboutView} from './views/about.js'
import {getCodeContentTemplates} from './views/code.js'
import {createDateView} from './views/date.js'
import {createIconsView} from './views/icons.js'
import {createLayoutView} from './views/layout.js'
import {createMainView, getMainContentTemplates} from './views/main.js'
import {createPaginationView} from './views/pagination.js'

const app = createApp({isLoading: true})

const target = document.querySelector(import.meta.env?.DEV ? 'body' : 'main')

export const _main = () => {
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

  if (import.meta.env?.DEV) {
    const aboutView = createAboutView({
      classes: aboutClasses
    })

    const iconsView = createIconsView({classes: iconsClasses})

    const layoutView = createLayoutView({
      classes: layoutClasses,
      aboutView,
      iconsView,
      mainView,
      anchorAttrs
    })

    view = createDOMView(target, layoutView)
  } else {
    view = createDOMView(target, mainView)

    for (const anchor of document.querySelectorAll('a[href^="/"]')) {
      anchor.addEventListener(
        'click',
        anchorAttrs(anchor.getAttribute('href'))['@click']
      )
    }
  }

  app.render(view)
}
