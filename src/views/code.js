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
      <span
        :class=${classes('blockLine', {comment: code.trim().startsWith('//')})}
      >
        <span class=${classes.blockCode}>${code}</span>
      </span>
    `,
    codeInline: (text) =>
      html`
        <code class=${classes.inline}>${text}</code>
      `
  }
}
