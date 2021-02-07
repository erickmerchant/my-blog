import {createApp, createDomView, html} from '@erickmerchant/framework/main.js'
import {layoutClasses} from './css/styles.js'
import {getSegments} from '../common.js'
import {createListComponent} from './components/list.js'
import {createFormComponent} from './components/form.js'
import {createErrorComponent} from './components/error.js'
import {slugify, createModel} from './model.js'

const state = {route: 'posts', posts: [], zIndex: 0}

const app = createApp(state)

const channels = {
  posts: {
    model: createModel('posts')
  },
  drafts: {
    model: createModel('drafts')
  }
}

const dispatchLocation = async (segments) => {
  let state = {
    route: 'error',
    error: Error('Route not found')
  }

  try {
    for (const [route, channel] of Object.entries(channels)) {
      if (segments.initial === `${route}/edit`) {
        const id = segments.last

        const item = await channel.model.getBySlug(id)

        if (item == null) throw Error(`item "${id}" not found`)

        item.highlightedContent = item.content

        state = {
          route: `${route}/edit`,
          item,
          slugConflict: false
        }
      } else if (segments.all === `${route}/create`) {
        state = {
          route: `${route}/create`,
          item: {},
          slugConflict: false
        }
      } else if (segments.all === route || segments.all === '') {
        const items = await channel.model.getAll()

        state = {
          route,
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

const errorComponent = createErrorComponent()

for (const [route, channel] of Object.entries(channels)) {
  channel.listComponent = createListComponent({
    model: channel.model,
    route,
    app
  })

  channel.formComponent = createFormComponent({
    model: channel.model,
    route,
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
        for (const [route, channel] of Object.entries(channels)) {
          if (state.route === route) {
            return channel.listComponent(state)
          }

          if ([`${route}/edit`, `${route}/create`].includes(state.route)) {
            return channel.formComponent(state)
          }
        }

        return errorComponent(state)
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
