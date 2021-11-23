import {html} from '@hyper-views/framework';

export const getContentViews = ({classes, getAnchorClick, iconView}) => {
  return {
    link: ({children, url}, inline) =>
      html`
        <a
          class=${classes.anchor}
          :href=${url}
          @click=${url.startsWith('/') ? getAnchorClick(url) : null}
        >
          ${inline(children)}
        </a>
      `,
    list: ({children}, inline) =>
      html`
        <ul class=${classes.list}>
          ${children.map(
            (item) =>
              html`
                <li class=${classes.listItem}>${inline(item.children)}</li>
              `
          )}
        </ul>
      `,
    paragraph: ({children}, inline) =>
      html`
        <p class=${classes.paragraph}>${inline(children)}</p>
      `,
    heading: ({children}) => {
      const text = children?.[0]?.value ?? '';
      const slug = text.toLowerCase().replace(/\s+|[^a-z0-9-]/g, '-');

      return html`
        <h2 class=${classes.heading2} :id=${slug}>
          <a
            class=${classes.heading2Anchor}
            :href=${`#${slug}`}
            :aria-labelledby=${slug}
          >
            ${iconView('link', classes.heading2Icon)}
          </a>
          ${text}
        </h2>
      `;
    },
  };
};
