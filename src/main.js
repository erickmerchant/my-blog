import {html} from '@erickmerchant/framework/main.js'

export const createMainComponent = ({
  classes,
  contentComponent,
  prettyDate,
  anchorAttrs
}) => (state) => {
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

  if (state.route === 'post') {
    return html`
      <article class=${classes.main}>
        <header>
          <h1 class=${classes.heading1}>${state.post.title}</h1>
          <time class=${classes.date} datetime=${state.post.date}>
            <svg viewBox="0 0 32 32" class=${classes.dateIcon}>
              <rect width="32" height="6" rx="0.5" />
              <rect width="32" height="22" y="8" rx="0.5" />
              <rect width="8" height="8" y="12" x="20" rx="0.5" fill="white" />
            </svg>
            <span>${prettyDate(state.post.date)}</span>
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
              <li class=${classes.listItem}>${items}</li>
            `,
          paragraph: (items) =>
            items.length
              ? html`
                  <p class=${classes.paragraph}>${items}</p>
                `
              : null
        })}
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
    <article class=${classes.main}>
      <h1 class=${classes.heading1}>${state.title ?? ''}</h1>
      <p class=${classes.paragraph}>${state.error?.message ?? ''}</p>
    </article>
  `
}
