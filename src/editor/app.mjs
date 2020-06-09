import {createApp, createDomView, html} from '@erickmerchant/framework/main.mjs'
import {classes} from './css/styles.mjs'
import {contentComponent, getSegments} from '../common.mjs'

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')

const getList = async () => {
  const res = await fetch('/content/posts/index.json')

  return res.json()
}

const postList = async (posts) => {
  await fetch('/content/posts/index.json', {
    headers: {'Content-Type': 'application/json'},
    method: 'POST',
    body: JSON.stringify(posts)
  })
}

const init = async () => {
  const posts = await getList()

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
      const slug = segments.last

      const posts = await getList()

      const index = posts.findIndex((p) => p.slug === slug)

      const post = index > -1 ? Object.assign({}, posts[index]) : {}

      const contentRes = await fetch(`/content/posts/${slug}.json`)

      if (contentRes.status >= 300) {
        return {
          error: Error(`${contentRes.status} ${contentRes.statusText}`)
        }
      }

      post.content = await contentRes.json()

      state = {
        route: 'posts/edit',
        slug,
        post,
        highlights: post.content
      }
    } else if (segments.all === 'posts/create') {
      state = {
        route: 'posts/create',
        post: {},
        highlights: ''
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

const highlighter = (str) =>
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
      const posts = await getList()

      const index = posts.findIndex((p) => p.slug === post.slug)

      if (index > -1) {
        posts.splice(index, 1)

        await postList(posts)
      }

      await fetch(`/content/posts/${post.slug}.json`, {
        method: 'DELETE'
      })

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

  const data = {}

  for (const [key, val] of Object.entries(post)) {
    data[key] = val
  }

  for (const [key, val] of new FormData(e.currentTarget)) {
    data[key] = val
  }

  try {
    const posts = await getList()

    if (!data.date) {
      const now = new Date()

      data.date = now.toISOString().substring(0, 10)
    }

    const index = posts.findIndex((post) => post.slug === data.slug)

    if (index === -1) {
      data.slug = data.slug || slugify(data.title)

      const {title, date, slug} = data

      posts.unshift({title, date, slug})
    } else {
      const {title, date, slug} = data

      posts.splice(index, 1, {title, date, slug})
    }

    data.content = data.content.replace(/\r/g, '')

    await postList(posts)

    await fetch(`/content/posts/${data.slug}.json`, {
      headers: {'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify(data.content)
    })

    window.location.hash = '#'
  } catch (error) {
    app.commit((state) => {
      state.error = error
    })
  }
}

const highlight = (e) =>
  app.commit((state) => {
    state.highlights = e.currentTarget.value

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
                <span class=${classes.headerSpacer} />
                <a class=${classes.createButton} href="#/posts/create">New</a>
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
                          ${new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'UTC'
                          })}
                        </td>
                        <td class=${classes.td}>
                          <a
                            class=${classes.textButton}
                            href=${`#/posts/edit/${post.slug}`}
                          >
                            Edit
                          </a>
                          <a
                            class=${classes.textButton}
                            target="_blank"
                            href=${`/posts/${post.slug}`}
                          >
                            View
                          </a>
                          <button
                            class=${classes.deleteButton}
                            type="button"
                            onclick=${remove(post)}
                          >
                            Delete
                          </button>
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
              <div class=${classes.formRow}>
                <div class=${classes.formColumn}>
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
                <div class=${classes.formColumn}>
                  <label class=${classes.label} for="Slug">Slug</label>
                  <input
                    class=${classes.input}
                    name="slug"
                    id="Slug"
                    readonly=${state.slug != null}
                    value=${state.post.slug ?? ''}
                    placeholder=${slugify(state.post.title ?? '')}
                    oninput=${state.slug == null
                      ? (e) =>
                          app.commit((state) => {
                            state.post.slug = e.currentTarget.value
                          })
                      : null}
                  />
                </div>
              </div>
              <label class=${classes.label} for="Content">Content</label>
              <div class=${classes.textareaWrap}>
                <div class=${classes.textareaHighlightsWrap}>
                  <pre class=${classes.textareaHighlights}>
${highlighter(state.highlights)}</pre
                  >
                </div>
                <textarea
                  class=${classes.textarea}
                  name="content"
                  id="Content"
                  oninput=${highlight}
                >
${state.post.content ?? ''}</textarea
                >
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
