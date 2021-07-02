import {concat} from '@erickmerchant/css'
import {html} from '@erickmerchant/framework'

export const createPaginationView =
  ({classes, anchorAttrs}) =>
  (state) => {
    return state.post.prev || state.post.next
      ? html`
          <nav class=${classes.nav}>
            <ul class=${classes.list}>
              ${[
                [state.post.prev, 'Older'],
                [state.post.next, 'Newer']
              ].map(
                ([item, text]) => html`
                  <li
                    :class=${concat(classes.item, {[classes.enabled]: !!item})}
                  >
                    ${item
                      ? html`
                          <a
                            ${anchorAttrs(`/posts/${item.slug}/`)}
                            class=${classes.anchor}
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
      : null
  }
