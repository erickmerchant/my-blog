import {html} from '@erickmerchant/framework'

export const getMainContentTemplates = ({classes}) => {
  return {
    anchor: ({text, href}) =>
      html`
        <a class=${classes.anchor} :href=${href}>${text}</a>
      `,
    list: ({items}) =>
      html`
        <ul class=${classes.list}>
          ${items.map(
            (item) =>
              html`
                <li class=${classes.listItem}>${item}</li>
              `
          )}
        </ul>
      `,
    paragraph: ({items}) =>
      html`
        <p class=${classes.paragraph}>${items}</p>
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
  ({classes, contentView, dateView, paginationView}) =>
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
                  ${state.post.date ? dateView(state.post.date) : ''}
                </header>
              `,
              ...contentView(state.post.content ?? ''),
              paginationView(state)
            ]
          : ''}
      </main>
    `
  }
