const codeFence = '```'

const escape = (str) => String(str).replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const defaultTemplates = {
  codeBlockClosing: '</code></pre>',
  codeBlockOpening: '<pre><code>',
  codeInline: (text) => `<code>${text}</code>`,
  heading: (text) => `<h2>${text}</h2>`,
  link: (text, href) => `<a href="${href}">${text}</a>`,
  listClosing: '</ul>',
  listItem: (text) => `<li>${text}</li>`,
  listOpening: '<ul>',
  paragraph: (text) => `<p>${text}</p>`,
  newline: '\n'
}

export const toHTML = (str, templates = defaultTemplates) => {
  const lineToHTML = (ln) => ln
    .replace(/`(.+?)`/g, (m, p1, offset) => (offset === 0 || ln.charAt(offset - 1) !== '\\' ? templates.codeInline(p1) : m))
    .replace(/\[(.+?)\]\((.+?)\)/g, (m, p1, p2, offset) => (offset === 0 || ln.charAt(offset - 1) !== '\\' ? templates.link(p1, p2) : m))

  let html = ''
  const lns = escape(str).split('\n')

  while (lns.length) {
    switch (true) {
      case lns[0].startsWith('# '):
        html += `${templates.heading(lns.shift().substring(2))}${templates.newline}`
        break

      case lns[0].startsWith('- '):
        html += templates.listOpening || ''

        while (lns.length && lns[0].startsWith('- ')) {
          html += `${templates.listItem(lineToHTML(lns.shift().substring(2)))}${templates.newline}`
        }

        html += templates.listClosing || ''

        lns.shift()
        break

      case lns[0] === codeFence: {
        lns.shift()

        const code = []

        while (lns.length && lns[0] !== codeFence) {
          code.push(lineToHTML(lns.shift()))
        }

        const last = lns.shift()

        html += `${templates.codeBlockOpening}${code.join('\n')}${templates.newline}${last === codeFence ? templates.codeBlockClosing : ''}${templates.newline}`
      }
        break

      default:
        html += `${templates.paragraph(lineToHTML(lns.shift()))}${templates.newline}`
    }
  }

  return html
}
