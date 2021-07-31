import {html} from '@erickmerchant/framework'

export const createPaginationView =
  ({classes, getAnchorClick}) =>
  (state) => {
    return state.post.prev || state.post.next
      ? html`
          <nav class=${classes.nav}>
            <ul class=${classes.list}>
              ${[
                [state.post.prev, 'Older'],
                [state.post.next, 'Newer']
              ].map(([item, text]) => {
                const href = item ? `/posts/${item.slug}/` : null

                return html`
                  <li :class=${item ? classes.itemEnabled : classes.item}>
                    ${item
                      ? html`
                          <a
                            class=${classes.anchor}
                            :href=${href}
                            @click=${getAnchorClick(href)}
                          >
                            ${text}
                          </a>
                        `
                      : text}
                  </li>
                `
              })}
            </ul>
          </nav>
        `
      : null
  }
