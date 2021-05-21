import {html} from '@erickmerchant/framework'

export const getCodeContentTemplates = ({classes}) => {
  return {
    codeBlock: (items) =>
      html`
        <pre
          class=${classes.pre}
        ><code class=${classes.block}>${items}</code></pre>
      `,
    codeBlockLine: (code) => html`
      <span class=${classes.blockLine}>
        <span class=${classes.blockCode}>${code}</span>
      </span>
    `,
    codeBlockComment: (comment) => html`
      <span class=${classes.blockComment}>
        <span class=${classes.blockCode}>${comment}</span>
      </span>
    `,
    codeInline: (text) =>
      html`
        <code class=${classes.inline}>${text}</code>
      `
  }
}
