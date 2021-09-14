import {createApp, createDOMView, html} from '@erickmerchant/framework'

import {
  aboutClasses,
  codeClasses,
  contentClasses,
  iconsClasses,
  layoutClasses,
  mainClasses,
  paginationClasses,
  preferencesClasses
} from './assets/styles/index.js'
import {createContentView, prettyDate} from './content.js'
import {DEV, PROD, SSR} from './envs.js'
import {createModel} from './model.js'
import {setupRouting} from './routing.js'
import {createAboutView} from './views/about.js'
import {getCodeViews} from './views/code.js'
import {getContentViews} from './views/content.js'
import {createIconsView} from './views/icons.js'
import {createLayoutView} from './views/layout.js'
import {createMainView} from './views/main.js'
import {createPaginationView} from './views/pagination.js'
import {createPreferencesButtonView} from './views/preferences-button.js'

const app = createApp({
  isLoading: true
})

export const _main = async (ENV = PROD) => {
  html.dev = ENV === DEV

  const postsModel = createModel()

  let getAnchorClick, mainView, preferencesView

  if (ENV === SSR) {
    getAnchorClick = () => null

    preferencesView = () =>
      html`
        <site-preferences />
      `

    mainView = () =>
      html`
        <main />
      `
  } else {
    getAnchorClick = setupRouting({app, postsModel, forceRoute: ENV === DEV})

    const paginationView = createPaginationView({
      classes: paginationClasses,
      getAnchorClick
    })

    const loadPreferencesForm = async () => {
      const {createPreferencesFormView} = await import(
        './views/preferences-form.js'
      )

      return createPreferencesFormView({classes: preferencesClasses, app})
    }

    let preferencesForm

    if (ENV === DEV) {
      if (app.state.preferencesModalOpen) {
        preferencesForm = await loadPreferencesForm()
      }
    }

    preferencesView = createPreferencesButtonView({
      classes: preferencesClasses,
      loadPreferencesForm,
      preferencesForm,
      app
    })

    mainView = createMainView({
      classes: mainClasses,
      contentView: createContentView({
        views: {
          ...getContentViews({classes: contentClasses, getAnchorClick}),
          ...getCodeViews({classes: codeClasses})
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
      preferencesView,
      getAnchorClick
    })

    if (ENV === SSR) return layoutView({title: ''})

    app.render(createDOMView(document.querySelector('body'), layoutView))
  } else {
    app.render(createDOMView(document.querySelector('main'), mainView))

    app.render(
      createDOMView(document.querySelector('site-preferences'), preferencesView)
    )

    for (const anchor of document.querySelectorAll('a[href^="/"]')) {
      const href = anchor.getAttribute('href')

      anchor.addEventListener('click', getAnchorClick(href))
    }
  }
}
