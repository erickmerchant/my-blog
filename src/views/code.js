import {html} from '@hyper-views/framework';

export const getCodeViews = ({classes}) => {
  return {
    code: ({value}) => {
      const lines = value.split('\n');

      return html`
        <pre class=${classes.pre}><code class=${classes.block}>${lines.map(
          (code) =>
            html`
              <span
                :class=${code.trim().startsWith('//')
                  ? classes.commentLine
                  : classes.codeLine}
              >
                <span class=${classes.blockCode}>${code}</span>
              </span>
            `
        )}</code></pre>
      `;
    },
    inlineCode: ({value}) =>
      html`
        <code class=${classes.inline}>${value}</code>
      `,
  };
};
