import {html, raw} from '@erickmerchant/framework'

const codeFence = '```'

const defaultTemplates = {
  codeBlock: (code) => html`<pre><code>${code}</code></pre>`,
  codeInline: (text) => html`<code>${text}</code>`,
  heading: (text) => html`<h2>${text}</h2>`,
  link: (text, href) => html`<a href=${href}>${text}</a>`,
  list: (items) => html`<ul>${items}</ul>`,
  listItem: (text) => html`<li>${text}</li>`,
  paragraph: (text) => html`<p>${text}</p>`
}

export const content = (str, templates = defaultTemplates) => {
  const inline = (ln) => {
    const results = []
    const matches = ln.matchAll(/\[(.*?)\]\((.*?)\)|`(.*?)`/g)
    let offset = 0

    for (const match of matches) {
      results.push(ln.substring(offset, match.index))

      if (match[1] != null) {
        results.push(templates.link(match[1], match[2]))
      }

      if (match[3] != null) {
        results.push(templates.codeInline(match[3]))
      }

      offset = match.index + match[0].length
    }

    results.push(ln.substring(offset))

    return results
  }

  const html = []
  const lns = str.split('\n')

  while (lns.length) {
    switch (true) {
      case lns[0].startsWith('# '):
        html.push(templates.heading(lns.shift().substring(2)))
        html.push('\n')
        break

      case lns[0].startsWith('- '): {
        const items = []

        while (lns.length && lns[0].startsWith('- ')) {
          items.push(templates.listItem(inline(lns.shift().substring(2))))
          items.push('\n')
        }

        html.push(templates.list(items))

        lns.shift()
      }
        break

      case lns[0] === codeFence: {
        lns.shift()

        const code = []

        while (lns.length && lns[0] !== codeFence) {
          code.push(lns.shift())
          code.push('\n')
        }

        lns.shift()

        html.push(templates.codeBlock(inline(code.join(''))))
        html.push('\n')
      }
        break

      default:
        html.push(templates.paragraph(inline(lns.shift())))
        html.push('\n')
    }
  }

  return html
}
