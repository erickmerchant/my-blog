import {html} from '@erickmerchant/framework/main.js'

export const getMainContentTemplates = ({classes}) => {
  return {
    heading: (text, slug) =>
      html`
        <h2 class=${classes.heading2} id=${slug}>
          ${text}
          <a class=${classes.heading2Anchor} href=${`#${slug}`}>#</a>
        </h2>
      `,
    codeBlock: (items) =>
      html`
        <pre
          class=${classes.pre}
        ><code class=${classes.codeBlock}>${items}</code></pre>
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
}) => (state) => (afterUpdate) => {
  if (state.route == null) {
    return html`
      <article class=${classes.main}></article>
    `
  }

  afterUpdate(() => {
    document.body.style = `--below-main-display: block;`
  })

  if (state.route.key === 'post') {
    return html`
      <article class=${classes.main}>
        <header class=${classes.header}>
          <h1 class=${classes.heading1}>${state.post.title}</h1>
          ${dateView(state.post.date)}
        </header>
        ${contentView(state.post.content ?? '')}
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
      </article>
    `
  }

  if (state.route.key === 'error') {
    return html`
      <article class=${classes.main}>
        <header class=${classes.header}>
          <h1 class=${classes.heading1}>${state.title ?? ''}</h1>
        </header>
        <p class=${classes.paragraph}>${state.error?.message ?? ''}</p>
      </article>
    `
  }
}
