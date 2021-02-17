import {createApp, createDomView, html} from '@erickmerchant/framework/main.js'
import {layoutClasses} from './css/styles.js'
import {getSegments} from '../common.js'
import {createListView} from './views/list.js'
import {createFormView} from './views/form.js'
import {createErrorView} from './views/error.js'
import {slugify, createModel} from './model.js'

const state = {route: 'posts', posts: [], zIndex: 0}

const app = createApp(state)

const channels = {
  posts: {
    model: createModel('/content/posts.json')
  },
  drafts: {
    model: createModel('/content/drafts.json')
  }
}

const dispatchLocation = async (segments) => {
  let state = {
    route: 'error',
    error: Error('Route not found')
  }

  try {
    for (const [channelName, channel] of Object.entries(channels)) {
      if (segments.initial === `${channelName}/edit`) {
        const id = segments.last

        const item = await channel.model.getBySlug(id)

        if (item == null) throw Error(`item "${id}" not found`)

        item.highlightedContent = item.content

        state = {
          route: `${channelName}/edit`,
          item,
          slugConflict: false
        }
      } else if (segments.all === `${channelName}/create`) {
        state = {
          route: `${channelName}/create`,
          item: {},
          slugConflict: false
        }
      } else if (segments.all === channelName || segments.all === '') {
        const items = await channel.model.getAll()

        state = {
          route: channelName,
          items
        }

        break
      }
    }
  } catch (error) {
    state = {
      route: 'error',
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
    <body
      class=${layoutClasses.app}
      style=${state.zIndex != null ? `--z-index: ${state.zIndex}` : null}
    >
      ${(() => {
        for (const [channelName, channel] of Object.entries(channels)) {
          if (state.route === channelName) {
            return channel.listView(state)
          }

          if (
            [`${channelName}/edit`, `${channelName}/create`].includes(
              state.route
            )
          ) {
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
  dispatchLocation(getSegments(window.location.hash.substring(1)))
}

window.onpopstate = onPopState

onPopState()
