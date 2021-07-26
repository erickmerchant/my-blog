import {html} from '@erickmerchant/framework'

export const createMainView =
  ({classes, contentView, paginationView, prettyDate}) =>
  (state) => {
    let content = ''

    if (!state.isLoading) {
      Promise.resolve().then(() => {
        document.body.style.setProperty('--below-main-display', 'block')
      })

      content = [
        html`
          <header class=${classes.header}>
            <h1 class=${classes.heading1}>${state.post.title}</h1>
            ${state.post.date
              ? html`
                  <time class=${classes.date} :datetime=${state.post.date}>
                    <svg class=${classes.dateIcon}>
                      <use href="#calendar" />
                    </svg>
                    ${prettyDate(state.post.date)}
                  </time>
                `
              : null}
          </header>
        `,
        ...contentView(state.post.content ?? ''),
        paginationView(state)
      ]
    }

    return html`
      <main class=${classes.main}>${content}</main>
    `
  }
