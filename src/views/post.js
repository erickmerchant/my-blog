import {html} from '@erickmerchant/framework'

export const getPostContentTemplates = ({classes}) => {
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
      `
  }
}

export const createPostView =
  ({classes, contentView, dateView, paginationView}) =>
  (state) => {
    return html`
      <main class=${classes.main}>
        <header class=${classes.header}>
          <h1 class=${classes.heading1}>${state.post.title}</h1>
          ${dateView(state.post.date)}
        </header>
        ${contentView(state.post.content ?? '')} ${paginationView(state)}
      </main>
    `
  }
