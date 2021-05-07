import {html} from '@erickmerchant/framework'

export const getMainContentTemplates = ({app, classes}) => {
  return {
    anchor: (text, href) =>
      html`
        <a class=${classes.anchor} :href=${href}>${text}</a>
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
        : null,
    heading: (text, slug) =>
      html`
        <h2 class=${classes.heading2} :id=${slug}>
          <a class=${classes.heading2Anchor} :href=${`#${slug}`}>#</a>
          ${text}
        </h2>
      `,
    codeBlock: (items) =>
      html`
        <pre
          class=${classes.pre}
        ><code class=${classes.codeBlock}>${items}</code>
        </pre>
      `,
    codeBlockLine: (code) => html`
      <span class=${classes.codeBlockLine}>
        <span class=${classes.codeBlockCode}>${code}</span>
      </span>
    `,
    codeBlockComment: (comment) => html`
      <span class=${classes.codeBlockComment}>
        <span class=${classes.codeBlockCode}>${comment}</span>
      </span>
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
  })

  if (state.route.key === 'post') {
    return html`
      <main class=${classes.main}>
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
                    [state.post.prev, 'Older'],
                    [state.post.next, 'Newer']
                  ].map(
                    ([item, text]) => html`
                      <li
                        :class=${item
                          ? classes.paginationItemEnabled
                          : classes.paginationItemDisabled}
                      >
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
