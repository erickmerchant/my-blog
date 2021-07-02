import {concat} from '@erickmerchant/css'
import {html} from '@erickmerchant/framework'

export const getCodeContentTemplates = ({classes}) => {
  return {
    codeBlock: ({lines}) =>
      html`
        <pre class=${classes.pre}><code class=${classes.block}>${lines.map(
          (code) =>
            html`
              <span
                :class=${concat(classes.blockLine, {
                  [classes.comment]: code.trim().startsWith('//')
                })}
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
