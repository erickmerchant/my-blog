import {css} from '@erickmerchant/css'
import {createApp, createDOMView, html} from '@erickmerchant/framework'

import {
  aboutClasses,
  codeClasses,
  iconsClasses,
  layoutClasses,
  mainClasses,
  paginationClasses
} from './asset/styles/index.js'
import {createContentView, prettyDate} from './content.js'
import {createModel} from './model.js'
import {DEV, PROD, SSR} from './modes.js'
import {setupRouting} from './routing.js'
import {createAboutView} from './views/about.js'
import {getCodeContentTemplates} from './views/code.js'
import {createIconsView} from './views/icons.js'
import {createLayoutView} from './views/layout.js'
import {createMainView, getMainContentTemplates} from './views/main.js'
import {createPaginationView} from './views/pagination.js'

const app = createApp({isLoading: true})

export const _main = (MODE = PROD) => {
  html.dev = MODE === DEV
  css.dev = MODE === DEV

  const postsModel = createModel()

  let anchorAttrs, paginationView, mainView, view

  if (MODE === SSR) {
    anchorAttrs = (href) => {
      return {href}
    }

    mainView = () =>
      html`
        <main></main>
      `
  } else {
    anchorAttrs = setupRouting({app, postsModel, forceRoute: MODE === DEV})

    paginationView = createPaginationView({
      classes: paginationClasses,
      anchorAttrs
    })

    mainView = createMainView({
      classes: mainClasses,
      contentView: createContentView({
        templates: {
          ...getMainContentTemplates({classes: mainClasses}),
          ...getCodeContentTemplates({classes: codeClasses})
        }
      }),
      paginationView,
      prettyDate
    })
  }

  if (MODE & SSR) {
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

    if (MODE === SSR) return layoutView({title: ''})

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
