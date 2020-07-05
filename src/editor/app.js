import {createApp, createDomView, html} from '@erickmerchant/framework/main.js'
import {classes} from './css/styles.js'
import {
  contentComponent,
  getSegments,
  prettyDate,
  createPostsModel
} from '../common.js'

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

const state = {route: 'posts', posts: []}

const app = createApp(state)

const dispatchLocation = async (segments) => {
  let state = {
    route: 'error',
    error: Error('Route not found')
  }

  try {
    if (segments.initial === 'posts/edit') {
      const id = segments.last

      const post = await postModel.get(id)

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

  app.commit(state)
}

const highlighter = (str = '') =>
  contentComponent(
    str.replace(/\r/g, ''),
    {
      bold: (text) => html`
        <span>
          <span class=${classes.highlightPunctuation}>*</span>
          <span class=${classes.highlightBold}>${text}</span>
          <span class=${classes.highlightPunctuation}>*</span>
        </span>
      `,
      codeBlock: (code, isClosed) => html`
        <span>
          <span class=${classes.highlightPunctuation}>${'```\n'}</span>
          <span class=${classes.highlightCodeBlock}>${code}</span>
          ${isClosed
            ? html`
                <span class=${classes.highlightPunctuation}>${'```'}</span>
              `
            : null}
        </span>
      `,
      codeInline: (text) => html`
        <span>
          <span class=${classes.highlightPunctuation}>${'`'}</span>
          <span class=${classes.highlightCodeInline}>${text}</span>
          <span class=${classes.highlightPunctuation}>${'`'}</span>
        </span>
      `,
      heading: (text) => html`
        <span>
          <span class=${classes.highlightHeadingPunctuation}>${'# '}</span>
          <span class=${classes.highlightHeading}>${text}</span>
        </span>
      `,
      link: (text, href) => html`
        <span>
          <span class=${classes.highlightPunctuation}>[</span>
          ${text}
          <span class=${classes.highlightPunctuation}>]</span>
          <span class=${classes.highlightPunctuation}>(</span>
          <a class=${classes.highlightUrl} href=${href}>${href}</a>
          <span class=${classes.highlightPunctuation}>)</span>
        </span>
      `,
      list: (items) =>
        html`
          <span>${items}</span>
        `,
      listItem: (text) => html`
        <span>
          <span class=${classes.highlightPunctuation}>${'- '}</span>
          ${text}
        </span>
      `,
      paragraph: (text) =>
        html`
          <span>${text}</span>
        `
    },
    false
  )

const remove = (post) => async (e) => {
  e.preventDefault()

  try {
    if (post.slug != null) {
      await postModel.remove(post.slug)

      const state = await init()

      app.commit(state)
    }
  } catch (error) {
    app.commit((state) => {
      state.error = error
    })
  }
}

const save = (post) => async (e) => {
  e.preventDefault()

  const id = post.slug

  const data = {}

  for (const [key, val] of Object.entries(post)) {
    data[key] = val
  }

  for (const [key, val] of new FormData(e.currentTarget)) {
    data[key] = val
  }

  try {
    await postModel.save(id, data)

    window.location.hash = '#'
  } catch (error) {
    app.commit((state) => {
      state.error = error
    })
  }
}

const highlight = (e) =>
  app.commit((state) => {
    state.post.highlightedContent = e.currentTarget.value

    state.post.content = e.currentTarget.value
  })

const lowerZindex = (e) => {
  if (e.key === 'Meta') {
    const current = Number(e.currentTarget.style.getPropertyValue('--z-index'))

    e.currentTarget.style.setProperty('--z-index', current === 0 ? -1 : 0)
  }
}

const resetZindex = (e) => {
  e.currentTarget.style.setProperty('--z-index', 0)
}

const target = document.querySelector('body')

const view = createDomView(
  target,
  (state) => html`
    <body class=${classes.app} onkeydown=${lowerZindex} onkeyup=${resetZindex}>
      ${(() => {
        if (state.route === 'posts') {
          return [
            html`
              <header class=${classes.header}>
                <h1 class=${classes.headerHeading}>Posts</h1>
                <span />
                <a
                  tabindex="0"
                  class=${classes.createButton}
                  href="#/posts/create"
                >
                  New
                </a>
              </header>
            `,
            html`
              <table class=${classes.table}>
                <thead>
                  <tr>
                    <th class=${classes.th}>Title</th>
                    <th class=${classes.th}>Date</th>
                    <th class=${classes.th} />
                  </tr>
                </thead>
                <tbody>
                  ${state.posts.map(
                    (post) => html`
                      <tr>
                        <td class=${classes.td}>${post.title}</td>
                        <td class=${classes.td}>
                          ${prettyDate(post.date)}
                        </td>
                        <td class=${classes.td}>
                          <div class=${classes.tableControls}>
                            <a
                              tabindex="0"
                              class=${classes.textButton}
                              href=${`#/posts/edit/${post.slug}`}
                            >
                              Edit
                            </a>
                            <a
                              tabindex="0"
                              class=${classes.textButton}
                              target="_blank"
                              href=${`/posts/${post.slug}`}
                            >
                              View
                            </a>
                            <button
                              tabindex="0"
                              class=${classes.deleteButton}
                              type="button"
                              onclick=${remove(post)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            `
          ]
        }

        if (['posts/edit', 'posts/create'].includes(state.route)) {
          return html`
            <form
              class=${classes.form}
              onsubmit=${save(state.post)}
              method="POST"
              autocomplete="off"
            >
              <div class=${classes.formRow}>
                <label class=${classes.labelLarge} for="Title">Title</label>
                <input
                  class=${classes.inputLarge}
                  name="title"
                  id="Title"
                  value=${state.post.title ?? ''}
                  oninput=${(e) =>
                    app.commit((state) => {
                      state.post.title = e.currentTarget.value
                    })}
                />
              </div>
              <div>
                <label class=${classes.label} for="Date">Date</label>
                <input
                  class=${classes.input}
                  name="date"
                  type="date"
                  id="Date"
                  value=${state.post.date ?? ''}
                  oninput=${(e) =>
                    app.commit((state) => {
                      state.post.date = e.currentTarget.value
                    })}
                />
              </div>
              <div>
                <label class=${classes.label} for="Slug">Slug</label>
                <input
                  class=${state.post.slug != null
                    ? classes.inputReadOnly
                    : classes.input}
                  name="slug"
                  id="Slug"
                  readonly=${state.post.slug != null}
                  value=${state.post.slug ?? ''}
                  placeholder=${slugify(state.post.title ?? '')}
                  oninput=${state.post.slug == null
                    ? (e) =>
                        app.commit((state) => {
                          state.post.slug = e.currentTarget.value
                        })
                    : null}
                />
              </div>
              <div class=${classes.formRow}>
                <label class=${classes.label} for="Content">Content</label>
                <div class=${classes.textareaWrap}>
                  <div class=${classes.textareaHighlightsWrap}>
                    <pre class=${classes.textareaHighlights}>
                      ${highlighter(state.post.highlightedContent)}
                    </pre
                    >
                  </div>
                  <textarea
                    class=${classes.textarea}
                    name="content"
                    id="Content"
                    oninput=${highlight}
                  >
                    ${state.post.content ?? ''}
                  </textarea
                  >
                </div>
              </div>
              <div class=${classes.formButtons}>
                <a class=${classes.cancelButton} href="#/">Cancel</a>
                <button class=${classes.saveButton} type="submit">Save</button>
              </div>
            </form>
          `
        }

        return html`
          <div>
            <h1 class=${classes.headerHeading}>${state.error.message}</h1>
            <pre class=${classes.stackTrace}>${state.error.stack}</pre>
          </div>
        `
      })()}
    </body>
  `
)

app.render(view)

window.onpopstate = () => {
  dispatchLocation(getSegments(document.location.hash.substring(1)))
}

dispatchLocation(getSegments(document.location.hash.substring(1)))
