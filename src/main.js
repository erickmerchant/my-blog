import {html} from '@erickmerchant/framework/main.js'

export const createMainComponent = ({
  classes,
  contentComponent,
  dateUtils,
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
    const date = dateUtils.stringToDate(state.post.date)
    const year = date.getFullYear()
    const month = date.getMonth()

    return html`
      <article
        class=${state.transitioning ? classes.mainTransitioning : classes.main}
      >
        <header>
          <h1 class=${classes.heading1}>${state.post.title}</h1>
          <time class=${classes.date} datetime=${state.post.date}>
            <svg viewBox="0 0 36 36" class=${classes.dateIcon}>
              <rect
                width="36"
                height="3"
                rx="1"
                class=${classes.dateIconContainer}
              />
              <rect
                width="36"
                height="32"
                x="0"
                y="4"
                rx="1"
                class=${classes.dateIconContainer}
              />
              ${{
                *[Symbol.iterator]() {
                  const daysInTheMonth = new Date(year, month + 1, 0).getDate()

                  let dayOfWeek = new Date(year, month, 1).getDay()

                  let weekOfMonth = 0

                  let i = 1

                  do {
                    yield html`
                      <rect
                        width="3"
                        height="3"
                        x=${4.5 + dayOfWeek * 4}
                        y=${8.5 + weekOfMonth * 4}
                        fill="white"
                      />
                    `

                    i++

                    dayOfWeek++

                    if (dayOfWeek > 6) {
                      weekOfMonth++

                      dayOfWeek = 0
                    }
                  } while (i <= daysInTheMonth)
                }
              }}
            </svg>
            <span>${dateUtils.prettyDate(date)}</span>
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
    <article
      class=${state.transitioning ? classes.mainTransitioning : classes.main}
    >
      <h1 class=${classes.heading1}>${state.title ?? ''}</h1>
      <p class=${classes.paragraph}>${state.error?.message ?? ''}</p>
    </article>
  `
}
