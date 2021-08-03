import {createApp, createDOMView, html} from '@erickmerchant/framework'

import {layoutClasses} from '../assets/editor/styles/index.js'
import {createModel} from './model.js'
import {createErrorView} from './views/error.js'
import {createFormView} from './views/form.js'
import {createListView} from './views/list.js'

const state = {route: {key: 'list', params: []}, posts: []}

const app = createApp(state)

const model = createModel()

const getRoute = (all, routes) => {
  for (const [key, regex] of Object.entries(routes)) {
    const match = all.match(regex)

    if (match) {
      return {
        key,
        params: match.slice(1)
      }
    }
  }
}

const handleRoute = async (route = {key: 'list', params: []}) => {
  let state = {
    route,
    error: Error('Route not found')
  }

  try {
    if (route.key === 'edit') {
      const [id] = route.params

      const item = await model.getBySlug(id)

      if (item == null) throw Error(`item "${id}" not found`)

      item.highlightedContent = item.content

      state = {
        route,
        item,
        slugConflict: false
      }
    } else if (route.key === 'create') {
      state = {
        route,
        item: {},
        slugConflict: false
      }
    } else if (route.key === 'list') {
      const items = await model.getList()

      state = {
        route,
        items
      }
    }
  } catch (error) {
    state = {
      route: {key: 'error'},
      error
    }
  }

  app.state = state
}

const target = document.querySelector('body')

const errorView = createErrorView()

const listView = createListView({
  model,
  app
})

const formView = createFormView({
  model,
  app
})

const view = createDOMView(
  target,
  (state) => html`
    <body class=${layoutClasses.app}>
      ${(() => {
        if (state.route.key === 'list') {
          return listView(state)
        }

        if (['edit', 'create'].includes(state.route.key)) {
          return formView(state)
        }

        return errorView(state)
      })()}
    </body>
  `
)

app.render(view)

const onPopState = () => {
  handleRoute(
    getRoute(window.location.hash.substring(1), {
      edit: /^\/?edit\/([a-z0-9-]+)\/?$/,
      create: /^\/?create\/?$/,
      list: /^\/?$/
    })
  )
}

window.onpopstate = onPopState

onPopState()
