import {createApp, createDomView, html} from '@erickmerchant/framework/main.js'
import {layoutClasses} from './css/styles.js'
import {getRoute, slugify} from '../common.js'
import {createListView} from './views/list.js'
import {createFormView} from './views/form.js'
import {createErrorView} from './views/error.js'
import {createModel} from './model.js'

const state = {route: {key: 'list', params: ['posts']}, posts: []}

const app = createApp(state)

const channels = {
  posts: {
    model: createModel('/content/posts.json')
  },
  drafts: {
    model: createModel('/content/drafts.json')
  }
}

const dispatchLocation = async (route = {key: 'list', params: ['posts']}) => {
  let state = {
    route,
    error: Error('Route not found')
  }

  try {
    for (const [channelName, channel] of Object.entries(channels)) {
      if (route.params[0] !== channelName) continue

      if (route.key === 'edit') {
        const [, id] = route.params

        const item = await channel.model.getBySlug(id)

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
        const items = await channel.model.getAll()

        state = {
          route,
          items
        }
      }
    }
  } catch (error) {
    state = {
      route: {key: 'error', params: []},
      error
    }
  }

  app.state = state
}

const target = document.querySelector('body')

const errorView = createErrorView()

for (const [channelName, channel] of Object.entries(channels)) {
  channel.listView = createListView({
    model: channel.model,
    channelName,
    app
  })

  channel.formView = createFormView({
    model: channel.model,
    channelName,
    app,
    slugify
  })
}

const view = createDomView(
  target,
  (state) => html`
    <body class=${layoutClasses.app}>
      ${(() => {
        for (const [channelName, channel] of Object.entries(channels)) {
          if (state.route.params[0] !== channelName) continue

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
  dispatchLocation(
    getRoute(window.location.hash.substring(1), {
      edit: /^\/?([a-z0-9-]+)\/edit\/([a-z0-9-]+)\/?$/,
      create: /^\/?([a-z0-9-]+)\/create\/?$/,
      list: /^\/?([a-z0-9-]+)\/?$/
    })
  )
}

window.onpopstate = onPopState

onPopState()
