const codeFence = '```'

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
    .replace(/`(.+?)`/g, (m, ...p) => templates.codeInline(...p))
    .replace(/\[(.+?)\]\((.+?)\)/g, (m, ...p) => templates.link(...p))

  let html = ''
  const lns = str.split('\n')

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

        html += `${templates.codeBlockOpening}${code.join('\n')}${last === codeFence ? templates.codeBlockClosing : ''}${templates.newline}`
      }
        break

      default:
        html += `${templates.paragraph(lineToHTML(lns.shift()))}${templates.newline}`
    }
  }

  return html
}
