import {html} from '@erickmerchant/framework';

export const getContentViews = ({classes, getAnchorClick}) => {
  return {
    anchor: ({text, href}) =>
      html`
        <a
          class=${classes.anchor}
          :href=${href}
          @click=${href.startsWith('/') ? getAnchorClick(href) : null}
        >
          ${text}
        </a>
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
      const slug = text.toLowerCase().replace(/\s+|[^a-z0-9-]/g, '-');

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
      `;
    },
  };
};
