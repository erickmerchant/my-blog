import {html} from '@erickmerchant/framework/main.js'

export const initialState = {route: '', title: ''}

const unfound = {
  route: 'error',
  title: 'Page Not Found',
  error: Error(
    "That page doesn't exist. It was either moved, removed, or never existed."
  )
}

export const dispatchLocation = async ({app, postModel, segments}) => {
  const posts = await postModel.getAll()

  let post

  try {
    if (segments.initial === 'posts') {
      post = await postModel.getBySlug(segments.last)
    } else if (segments.all === '' && posts.length > 0) {
      post = await postModel.getBySlug()
    }

    if (post != null) {
      app.commit({
        route: 'post',
        title: `Posts | ${post.title}`,
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

const yearsSince = (year, month) => {
  const thenAsFloat = year + (month + 1) / 12

  const now = new Date()

  const nowAsFloat = now.getFullYear() + (now.getMonth() + 1) / 12

  return Math.floor(nowAsFloat - thenAsFloat)
}

const aboutContent = `
# About Me

I'm *Erick Merchant*. I've been employed as a web developer for *${yearsSince(
  2006,
  6
)}* years. This is my web development blog. Check out my [open-source projects](https://github.com/erickmerchant) on Github.
`

export const createComponent = ({
  app,
  classes,
  postModel,
  contentComponent,
  extraFooterLink,
  getSegments,
  prettyDate
}) => {
  const contentTemplates = {
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
        <li class=${classes.listItem}>${items}</li>
      `,
    paragraph: (items) =>
      items.length
        ? html`
            <p class=${classes.paragraph}>${items}</p>
          `
        : null
  }

  const anchorAttrs = (href) => {
    return {
      href,
      onclick(e) {
        e.preventDefault()

        window.history.pushState({}, null, href)

        dispatchLocation({app, postModel, segments: getSegments(href)})

        window.scroll(0, 0)
      }
    }
  }

  const paginationItem = (obj, text) =>
    html`
      <li
        class=${obj
          ? classes.paginationItemEnabled
          : classes.paginationItemDisabled}
      >
        ${obj
          ? html`
              <a
                ${anchorAttrs(`/posts/${obj.slug}/`)}
                class=${classes.paginationAnchor}
              >
                ${text}
              </a>
            `
          : text}
      </li>
    `

  return (state) => html`
    <body class=${classes.app}>
      <div class=${classes.hero}>
        <div class=${classes.heroInner}>
          <header class=${classes.header}>
            <a ${anchorAttrs('/')} class=${classes.headerAnchor}>
              ErickMerchant.com
            </a>
          </header>
          <aside class=${classes.aboutContent}>
            <div class=${classes.aboutContentInner}>
              ${contentComponent(
                aboutContent,
                Object.assign({}, contentTemplates, {
                  heading: (text) =>
                    html`
                      <h3 class=${classes.aboutHeading}>${text}</h3>
                    `,
                  link: (text, href) =>
                    html`
                      <a class=${classes.aboutAnchor} href=${href}>${text}</a>
                    `,
                  paragraph: (items) =>
                    items.length
                      ? html`
                          <p class=${classes.aboutParagraph}>${items}</p>
                        `
                      : null
                })
              )}
            </div>
          </aside>
        </div>
      </div>
      ${() => {
        if (state.route === 'post') {
          return html`
            <article class=${classes.main}>
              <header>
                <h1 class=${classes.heading1}>${state.post.title}</h1>
                <time class=${classes.date} datetime=${state.post.date}>
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
                  <span>${prettyDate(state.post.date)}</span>
                </time>
              </header>
              ${contentComponent(state.post.content ?? '', contentTemplates)}
              ${state.post.prev || state.post.next
                ? html`
                    <nav>
                      <ul class=${classes.paginationList}>
                        ${paginationItem(state.post.prev, 'Older')}
                        ${paginationItem(state.post.next, 'Newer')}
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
              <nav class=${classes.footerNav}>
                <ul class=${classes.footerNavList}>
                  ${extraFooterLink ?? ''}
                  <li class=${classes.footerNavItem}>
                    <a
                      class=${classes.footerNavAnchor}
                      href="https://github.com/erickmerchant/my-blog"
                    >
                      View Source
                    </a>
                  </li>
                  <li class=${classes.footerNavItem}>
                    © ${new Date().getFullYear()} Erick Merchant
                  </li>
                </ul>
              </nav>
            </footer>
          `
        : null}
    </body>
  `
}

export const setupApp = ({app, postModel, getSegments}) => {
  window.onpopstate = () => {
    dispatchLocation({
      app,
      postModel,
      segments: getSegments(document.location.pathname)
    })
  }

  dispatchLocation({
    app,
    postModel,
    segments: getSegments(document.location.pathname)
  })
}
