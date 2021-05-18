import {html} from '@erickmerchant/framework'

export const getCodeContentTemplates = ({classes}) => {
  return {
    codeBlock: (items) =>
      html`
        <pre
          class=${classes.pre}
        ><code class=${classes.codeBlock}>${items}</code>
        </pre>
      `,
    codeBlockLine: (code) => html`
      <span class=${classes.codeBlockLine}>
        <span class=${classes.codeBlockCode}>${code}</span>
      </span>
    `,
    codeBlockComment: (comment) => html`
      <span class=${classes.codeBlockComment}>
        <span class=${classes.codeBlockCode}>${comment}</span>
      </span>
    `,
    codeInline: (text) =>
      html`
        <code class=${classes.codeInline}>${text}</code>
      `
  }
}
