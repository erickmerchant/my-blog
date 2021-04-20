import {html} from '@erickmerchant/framework'

export const getMainContentTemplates = ({app, classes}) => {
  return {
    heading: (text, slug) =>
      html`
        <h2 class=${classes.heading2} id=${slug}>
          ${text}
          <a class=${classes.heading2Anchor} href=${`#${slug}`}>#</a>
        </h2>
      `,
    codeBlock: (items, {wrapCode}) =>
      html`
        <pre
          class=${classes.pre}
        ><code class=${classes.codeBlock}>${items}</code>
        </pre>
      `,
    codeBlockLine: (code) => html`
      <span class=${classes.codeBlockLine}><span>${code}</span></span>
    `,
    codeBlockComment: (comment) => html`
      <span class=${classes.codeBlockComment}><span>${comment}</span></span>
    `,
    codeInline: (text) =>
      html`
        <code class=${classes.codeInline}>${text}</code>
      `
  }
}

export const createMainView = ({
  classes,
  contentView,
  dateView,
  anchorAttrs
}) => (state) => {
  if (state.route == null) {
    return html`
      <main class=${classes.main}></main>
    `
  }

  Promise.resolve().then(() => {
    document.body.style.setProperty('--below-main-display', 'block')

    document.body.style.setProperty(
      '--code-white-space',
      state.wrapCode ? 'pre-wrap' : 'pre'
    )
  })

  if (state.route.key === 'post') {
    return html`
      <main class=${classes.main}>
        <header class=${classes.header}>
          <h1 class=${classes.heading1}>${state.post.title}</h1>
          ${dateView(state.post.date)}
        </header>
        ${contentView(state.post.content ?? '', {wrapCode: state.wrapCode})}
        ${state.post.prev || state.post.next
          ? html`
              <nav class=${classes.pagination}>
                <ul class=${classes.paginationList}>
                  ${[
                    [
                      state.post.prev,
                      {
                        enabled: classes.paginationItemEnabledOlder,
                        disabled: classes.paginationItemDisabledOlder
                      },
                      'Older'
                    ],
                    [
                      state.post.next,
                      {
                        enabled: classes.paginationItemEnabledNewer,
                        disabled: classes.paginationItemDisabledNewer
                      },
                      'Newer'
                    ]
                  ].map(
                    ([item, cls, text]) => html`
                      <li class=${item ? cls.enabled : cls.disabled}>
                        ${item
                          ? html`
                              <a
                                ${anchorAttrs(`/posts/${item.slug}/`)}
                                class=${classes.paginationAnchor}
                              >
                                ${text}
                              </a>
                            `
                          : text}
                      </li>
                    `
                  )}
                </ul>
              </nav>
            `
          : null}
      </main>
    `
  }

  if (state.route.key === 'error') {
    return html`
      <main class=${classes.main}>
        <header class=${classes.header}>
          <h1 class=${classes.heading1}>${state.title ?? ''}</h1>
        </header>
        <p class=${classes.message}>${state.message ?? ''}</p>
      </main>
    `
  }
}
