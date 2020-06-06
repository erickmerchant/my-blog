import {html} from '@erickmerchant/framework'

const fetchOptions = {
  headers: {'Content-Type': 'application/json'},
  mode: 'no-cors'
}

export const initialState = {route: '', title: ''}

const unfound = {
  route: 'error',
  title: 'Page Not Found',
  error: Error(
    "That page doesn't exist. It was either moved, removed, or never existed."
  )
}

export const dispatchLocation = async (app, segments) => {
  const posts = await fetch(
    '/content/posts/index.json',
    fetchOptions
  ).then((res) => res.json())

  let index = -1

  try {
    if (segments.initial === 'posts') {
      index = posts.findIndex((post) => post.slug === segments.last)
    } else if (segments.all === '' && posts.length > 0) {
      index = 0
    }

    if (index > -1) {
      const post = Object.assign({}, posts[index])

      const response = await fetch(
        `/content/posts/${post.slug}.json`,
        fetchOptions
      )

      const content = await response.json()

      post.content = content

      app.commit({
        route: 'post',
        title: `Posts | ${post.title}`,
        next: posts[index - 1],
        prev: posts[index + 1],
        post
      })
    } else {
      app.commit(unfound)
    }
  } catch (error) {
    app.commit({
      route: 'error',
      title: '500 Error',
      error
    })
  }
}

export const createComponent = (
  app,
  classes,
  getSegments,
  contentComponent
) => {
  const anchorAttrs = (href) => {
    return {
      href,
      onclick(e) {
        e.preventDefault()

        window.history.pushState({}, null, href)

        dispatchLocation(app, getSegments(href))
      }
    }
  }

  const paginationLink = (slug, text) =>
    html`
      <a ${anchorAttrs(`/posts/${slug}/`)} class=${classes.buttonAnchor}>
        ${text}
      </a>
    `

  return (state) => (afterUpdate) => {
    afterUpdate(() => {
      window.scroll(0, 0)
    })

    return html`
      <body class=${classes.app}>
        <header>
          <nav class=${classes.topNav}>
            <ul class=${classes.topNavList}>
              <li class=${classes.navListItem}>
                <a class=${classes.navAnchor} ${anchorAttrs('/')}>
                  Erick Merchant
                </a>
              </li>
              <li class=${classes.navListItem}>
                <a
                  class=${classes.navAnchor}
                  href="https://github.com/erickmerchant"
                >
                  Projects
                </a>
              </li>
            </ul>
          </nav>
        </header>
        ${() => {
          if (state.route === 'post') {
            return html`
              <article class=${classes.main}>
                <header>
                  <h1 class=${classes.heading1}>${state.post.title}</h1>
                  <time
                    class=${classes.date}
                    datetime=${new Date(state.post.date).toISOString()}
                  >
                    <svg viewBox="0 0 32 32" class=${classes.dateIcon}>
                      <rect width="32" height="6" rx="0.5" />
                      <rect width="32" height="22" y="8" rx="0.5" />
                      <rect
                        width="8"
                        height="8"
                        y="12"
                        x="20"
                        rx="0.5"
                        fill="white"
                      />
                    </svg>
                    <span>
                      ${new Date(state.post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        timeZone: 'UTC'
                      })}
                    </span>
                  </time>
                </header>
                ${contentComponent(state.post.content ?? '', {
                  bold: (text) =>
                    html`
                      <strong class=${classes.strong}>${text}</strong>
                    `,
                  codeBlock: (items) =>
                    html`
                      <pre
                        class=${classes.pre}
                      ><code class=${classes.codeBlock}>${items}</code></pre>
                    `,
                  codeInline: (text) =>
                    html`
                      <code class=${classes.code}>${text}</code>
                    `,
                  heading: (text) =>
                    html`
                      <h2 class=${classes.heading2}>${text}</h2>
                    `,
                  link: (text, href) =>
                    html`
                      <a class=${classes.anchor} href=${href}>${text}</a>
                    `,
                  list: (items) =>
                    html`
                      <ul class=${classes.list}>
                        ${items}
                      </ul>
                    `,
                  listItem: (items) =>
                    html`
                      <li>${items}</li>
                    `,
                  paragraph: (items) =>
                    items.length
                      ? html`
                          <p class=${classes.paragraph}>${items}</p>
                        `
                      : null
                })}
                ${state.prev || state.next
                  ? html`
                      <nav>
                        <ul class=${classes.navList}>
                          <li
                            class=${state.prev
                              ? classes.button
                              : classes.buttonDisabled}
                          >
                            ${state.prev
                              ? paginationLink(state.prev.slug, 'Older')
                              : null}
                          </li>
                          <li
                            class=${state.next
                              ? classes.button
                              : classes.buttonDisabled}
                          >
                            ${state.next
                              ? paginationLink(state.next.slug, 'Newer')
                              : null}
                          </li>
                        </ul>
                      </nav>
                    `
                  : null}
              </article>
            `
          }

          return html`
            <section class=${classes.main}>
              <h1 class=${classes.heading1}>${state.title ?? ''}</h1>
              <p class=${classes.paragraph}>${state.error?.message ?? ''}</p>
            </section>
          `
        }}
        ${state.route !== ''
          ? html`
              <footer class=${classes.footer}>
                <ul class=${classes.footerList}>
                  <li class=${classes.navListItem}>
                    <a
                      class=${classes.navAnchor}
                      href="https://github.com/erickmerchant/my-blog"
                    >
                      View Source
                    </a>
                  </li>
                  <li class=${classes.navListItem}>
                    © ${new Date().getFullYear()} Erick Merchant
                  </li>
                </ul>
              </footer>
            `
          : null}
      </body>
    `
  }
}

export const setupApp = (app, getSegments) => {
  window.onpopstate = () => {
    dispatchLocation(app, getSegments(document.location.pathname))
  }

  dispatchLocation(app, getSegments(document.location.pathname))
}
