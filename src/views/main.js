import {html} from '@erickmerchant/framework'

export const getMainContentTemplates = ({classes}) => {
  return {
    anchor: ({text, href}) =>
      html`
        <a class=${classes.anchor} :href=${href}>${text}</a>
      `,
    list: ({items}, inline) =>
      html`
        <ul class=${classes.list}>
          ${items.map(
            (item) =>
              html`
                <li class=${classes.listItem}>${inline(item)}</li>
              `
          )}
        </ul>
      `,
    paragraph: ({items}, inline) =>
      html`
        <p class=${classes.paragraph}>${inline(items)}</p>
      `,
    heading: ({text}) => {
      const slug = text.toLowerCase().replace(/\s+|[^a-z0-9-]/g, '-')

      return html`
        <h2 class=${classes.heading2} :id=${slug}>
          <a
            class=${classes.heading2Anchor}
            :href=${`#${slug}`}
            :aria-labelledby=${slug}
          >
            <svg class=${classes.heading2Icon}><use href="#link" /></svg>
          </a>
          ${text}
        </h2>
      `
    }
  }
}

export const createMainView =
  ({classes, contentView, paginationView, prettyDate}) =>
  (state) => {
    if (!state.isLoading) {
      Promise.resolve().then(() => {
        document.body.style.setProperty('--below-main-display', 'block')
      })
    }

    return html`
      <main class=${classes.main}>
        ${!state.isLoading
          ? [
              html`
                <header class=${classes.header}>
                  <h1 class=${classes.heading1}>${state.post.title}</h1>
                  <time class=${classes.date} :datetime=${state.post.date}>
                    <svg viewBox="0 0 33 33" class=${classes.dateIcon}>
                      <use href="#calendar" />
                    </svg>
                    ${prettyDate(state.post.date)}
                  </time>
                </header>
              `,
              ...contentView(state.post.content ?? ''),
              paginationView(state)
            ]
          : ''}
      </main>
    `
  }
