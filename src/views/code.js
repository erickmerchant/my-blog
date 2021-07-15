import {html} from '@erickmerchant/framework'

export const getCodeContentViews = ({classes}) => {
  return {
    codeBlock: ({lines}) =>
      html`
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
      `,
    codeInline: ({text}) =>
      html`
        <code class=${classes.inline}>${text}</code>
      `
  }
}
