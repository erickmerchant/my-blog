import {html} from '@erickmerchant/framework/main.js'

export const createMainComponent = ({
  classes,
  contentComponent,
  dateUtils,
  anchorAttrs
}) => (state) => {
  if (state.route == null) {
    return html`
      <article></article>
    `
  }

  return (afterUpdate) => {
    afterUpdate(() => {
      document.body.style = `--below-fold-display: block;`
    })

    if (state.route === 'post') {
      const date = dateUtils.stringToDate(state.post.date)
      const year = date.getFullYear()
      const month = date.getMonth()

      return html`
        <article
          class=${state.transitioning
            ? classes.mainTransitioning
            : classes.main}
        >
          <header class=${classes.header}>
            <h1 class=${classes.heading1}>${state.post.title}</h1>
            <time class=${classes.date} datetime=${state.post.date}>
              <svg viewBox="0 0 33 33" class=${classes.dateIcon}>
                <rect
                  width="35"
                  height="5"
                  x="0"
                  y="0"
                  class=${classes.dateIconPart}
                />
                <rect
                  width="35"
                  height="2"
                  x="0"
                  y="31"
                  class=${classes.dateIconPart}
                />
                <rect
                  width="2"
                  height="35"
                  x="0"
                  y="0"
                  class=${classes.dateIconPart}
                />
                <rect
                  width="2"
                  height="35"
                  x="31"
                  y="0"
                  class=${classes.dateIconPart}
                />
                ${{
                  *[Symbol.iterator]() {
                    const daysInTheMonth = new Date(
                      year,
                      month + 1,
                      0
                    ).getDate()

                    let dayOfWeek = new Date(year, month, 1).getDay()

                    let weekOfMonth = 0

                    let i = 1

                    do {
                      yield html`
                        <rect
                          width="3"
                          height="3"
                          x=${3 + dayOfWeek * 4}
                          y=${7 + weekOfMonth * 4}
                          class=${classes.dateIconPart}
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
          ${contentComponent(state.post.content ?? '', classes, {
            heading: (text) =>
              html`
                <h2 class=${classes.heading2}>${text}</h2>
              `,
            codeBlock: (items) =>
              html`
                <pre
                  class=${classes.pre}
                ><code class=${classes.codeBlock}>${items}</code></pre>
              `,
            codeInline: (text) =>
              html`
                <code class=${classes.codeInline}>${text}</code>
              `
          })}
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

    if (state.route === 'error') {
      return html`
        <article
          class=${state.transitioning
            ? classes.mainTransitioning
            : classes.main}
        >
          <header class=${classes.header}>
            <h1 class=${classes.heading1}>${state.title ?? ''}</h1>
          </header>
          <p class=${classes.paragraph}>${state.error?.message ?? ''}</p>
        </article>
      `
    }
  }
}
