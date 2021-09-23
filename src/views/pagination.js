import {html} from '@erickmerchant/framework';

export const createPaginationView = ({classes, getAnchorClick}) => {
  const paginationItem = (item, text) => {
    const href = item ? `/posts/${item.slug}/` : null;

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
    `;
  };

  return (state) =>
    state.post.prev || state.post.next
      ? html`
          <nav class=${classes.nav}>
            <ul class=${classes.list}>
              ${paginationItem(state.post.prev, 'Older')}
              ${paginationItem(state.post.next, 'Newer')}
            </ul>
          </nav>
        `
      : null;
};
