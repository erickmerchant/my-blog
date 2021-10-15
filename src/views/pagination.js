import {html} from '@hyper-views/framework';

export const createPaginationView = ({classes, getAnchorClick}) => {
  const paginationItem = (slug, text) => {
    const href = slug ? `/posts/${slug}/` : null;

    return html`
      <li :class=${slug ? classes.itemEnabled : classes.item}>
        ${slug
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
    state.post.previous || state.post.next
      ? html`
          <nav class=${classes.nav}>
            <ul class=${classes.list}>
              ${paginationItem(state.post.previous, 'Older')}
              ${paginationItem(state.post.next, 'Newer')}
            </ul>
          </nav>
        `
      : null;
};
