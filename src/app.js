import {createApp, createDOMView, html} from '@erickmerchant/framework'

import {
  aboutClasses,
  codeClasses,
  iconsClasses,
  layoutClasses,
  mainClasses,
  paginationClasses
} from './assets/styles/index.js'
import {createContentView, prettyDate} from './content.js'
import {DEV, PROD, SSR} from './envs.js'
import {createModel} from './model.js'
import {setupRouting} from './routing.js'
import {createAboutView} from './views/about.js'
import {getCodeContentViews} from './views/code.js'
import {createIconsView} from './views/icons.js'
import {createLayoutView} from './views/layout.js'
import {createMainView, getMainContentViews} from './views/main.js'
import {createPaginationView} from './views/pagination.js'

const app = createApp({isLoading: true})

export const _main = (ENV = PROD) => {
  html.dev = ENV === DEV

  const postsModel = createModel()

  let anchorAttrs, paginationView, mainView, view

  if (ENV === SSR) {
    anchorAttrs = (href) => {
      return {href}
    }

    mainView = () =>
      html`
        <main></main>
      `
  } else {
    anchorAttrs = setupRouting({app, postsModel, forceRoute: ENV === DEV})

    paginationView = createPaginationView({
      classes: paginationClasses,
      anchorAttrs
    })

    mainView = createMainView({
      classes: mainClasses,
      contentView: createContentView({
        views: {
          ...getMainContentViews({classes: mainClasses}),
          ...getCodeContentViews({classes: codeClasses})
        }
      }),
      paginationView,
      prettyDate
    })
  }

  if (ENV !== PROD) {
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

    if (ENV === SSR) return layoutView({title: ''})

    view = createDOMView(document.querySelector('body'), layoutView)
  } else {
    view = createDOMView(document.querySelector('main'), mainView)

    for (const anchor of document.querySelectorAll('a[href^="/"]')) {
      anchor.addEventListener(
        'click',
        anchorAttrs(anchor.getAttribute('href'))['@click']
      )
    }
  }

  app.render(view)
}
