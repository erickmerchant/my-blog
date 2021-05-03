import {createApp, createDomView, html} from '@erickmerchant/framework'

import {getRoute} from '../routing.js'
import {layoutClasses} from './css/index.js'
import {createModel} from './model.js'
import {createErrorView} from './views/error.js'
import {createFormView} from './views/form.js'
import {createListView} from './views/list.js'

const state = {route: {key: 'list', params: ['posts']}, posts: []}

const app = createApp(state)

const channels = [createModel('posts'), createModel('drafts')]

const handleRoute = async (route = {key: 'list', params: ['posts']}) => {
  let state = {
    route,
    error: Error('Route not found')
  }

  try {
    for (const channel of channels) {
      if (route.params?.[0] !== channel.name) continue

      if (route.key === 'edit') {
        const [, id] = route.params

        const item = await channel.getBySlug(id)

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
        const items = await channel.getAll()

        state = {
          route,
          items
        }
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

const channelNames = channels.map((channel) => channel.name)

for (const channel of channels) {
  channel.listView = createListView({
    model: channel,
    channelNames,
    hasNew: channel.name !== 'posts',
    app
  })

  channel.formView = createFormView({
    model: channel,
    app
  })
}

const view = createDomView(
  target,
  (state) => html`
    <body class=${layoutClasses.app}>
      ${(() => {
        for (const channel of channels) {
          if (state.route.params?.[0] !== channel.name) continue

          if (state.route.key === 'list') {
            return channel.listView(state)
          }

          if (['edit', 'create'].includes(state.route.key)) {
            return channel.formView(state)
          }
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
      edit: /^\/?([a-z0-9-]+)\/edit\/([a-z0-9-]+)\/?$/,
      create: /^\/?([a-z0-9-]+)\/create\/?$/,
      list: /^\/?([a-z0-9-]+)\/?$/
    })
  )
}

window.onpopstate = onPopState

onPopState()
