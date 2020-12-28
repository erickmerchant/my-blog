import {createApp, createDomView, html} from '@erickmerchant/framework/main.js'
import {layoutClasses} from './css/styles.js'
import {getSegments, createPostsModel} from '../common.js'
import {createListComponent} from './components/list.js'
import {createFormComponent} from './components/form.js'
import {createErrorComponent} from './components/error.js'

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')

const fetch = async (url, options) => {
  const res = await window.fetch(url, options)

  if (res.status >= 300) {
    throw Error(`${res.status} ${res.statusText}`)
  }

  return res
}

const postModel = {
  ...createPostsModel(fetch),

  async saveAll(data) {
    await fetch('/content/posts/index.json', {
      headers: {'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  async save(id, data) {
    const posts = await this.getAll()

    const exists = id != null

    id = id ?? (data.slug || slugify(data.title))

    const index = posts.findIndex((post) => post.slug === id)

    if (!exists && ~index) {
      throw Error(`"${id}" already exists`)
    }

    if (!data.date) {
      const now = new Date()

      data.date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(now.getDate()).padStart(2, '0')}`
    }

    data.slug = id

    data.content = data.content.replace(/\r/g, '')

    const {title, date, slug} = data

    if (!~index) {
      posts.unshift({title, date, slug})
    } else {
      posts.splice(index, 1, {title, date, slug})
    }

    await this.saveAll(posts)

    await fetch(`/content/posts/${id}.json`, {
      headers: {'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify(data.content)
    })
  },

  async remove(id) {
    const posts = await this.getAll()

    const index = posts.findIndex((p) => p.slug === id)

    if (~index) {
      posts.splice(index, 1)

      await this.saveAll(posts)

      await fetch(`/content/posts/${id}.json`, {
        method: 'DELETE'
      })
    }
  }
}

const init = async () => {
  const posts = await postModel.getAll()

  return {
    route: 'posts',
    posts
  }
}

const state = {route: 'posts', posts: [], zIndex: 0}

const app = createApp(state)

const dispatchLocation = async (segments) => {
  let state = {
    route: 'error',
    error: Error('Route not found')
  }

  try {
    if (segments.initial === 'posts/edit') {
      const id = segments.last

      const post = await postModel.getBySlug(id)

      if (post == null) throw Error(`post "${id}" not found`)

      post.highlightedContent = post.content

      state = {
        route: 'posts/edit',
        post
      }
    } else if (segments.all === 'posts/create') {
      state = {
        route: 'posts/create',
        post: {}
      }
    } else if (segments.all === '') {
      state = await init()
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
const listComponent = createListComponent({postModel, app, init})
const formComponent = createFormComponent({postModel, app, slugify})

const view = createDomView(
  target,
  (state) => html`
    <body
      class=${layoutClasses.app}
      style=${state.zIndex != null ? `--z-index: ${state.zIndex}` : null}
    >
      ${(() => {
        if (state.route === 'posts') {
          return listComponent(state)
        }

        if (['posts/edit', 'posts/create'].includes(state.route)) {
          return formComponent(state)
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
