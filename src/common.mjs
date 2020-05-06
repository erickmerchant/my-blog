import {html} from '@erickmerchant/framework'
import {classes} from './css/styles.mjs'

const codeFence = '```'

const defaultTemplates = {
  bold: (text) => html`<strong class=${classes.strong}>${text}</strong>`,
  codeBlock: (items) => html`<pre class=${classes.pre}><code class=${classes.codeBlock}>${items}</code></pre>`,
  codeInline: (text) => html`<code class=${classes.code}>${text}</code>`,
  heading: (text) => html`<h2 class=${classes.heading2}>${text}</h2>`,
  link: (text, href) => html`<a class=${classes.anchor} href=${href}>${text}</a>`,
  list: (items) => html`<ul class=${classes.list}>${items}</ul>`,
  listItem: (items) => html`<li>${items}</li>`,
  paragraph: (items) => (items.length ? html`<p class=${classes.paragraph}>${items}</p>` : null)
}

export const content = (str, stripBackslash = true, templates = defaultTemplates) => {
  const inline = (ln) => {
    if (ln === '') return []

    const results = []
    const matches = ln.matchAll(/\[(.*?)\]\((.*?)\)|`(.*?)`|\*(.*?)\*/g)
    let offset = 0

    for (const match of matches) {
      let unescaped = true

      if (match.index > 0 && ln.substring(match.index - 1, match.index) === '\\') {
        unescaped = false

        if (match.index > 1 && ln.substring(match.index - 2, match.index) === '\\\\') {
          unescaped = true
        } else {
          if (!stripBackslash) continue

          results.push(`${ln.substring(offset, match.index - 1)}${match[0]}`)
        }
      }

      if (unescaped) {
        results.push(ln.substring(offset, match.index))

        if (match[1] != null) {
          results.push(templates.link(match[1], match[2]))
        }

        if (match[3] != null) {
          results.push(templates.codeInline(match[3]))
        }

        if (match[4] != null) {
          results.push(templates.bold(match[4]))
        }
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
      }
        break

      case lns[0] === codeFence: {
        lns.shift()

        const code = []

        while (lns.length && lns[0] !== codeFence) {
          code.push(lns.shift())
          code.push('\n')
        }

        const close = lns.shift()

        html.push(templates.codeBlock(inline(code.join('')), close === codeFence))
        html.push('\n')
      }
        break

      case lns[0] === `\\${codeFence}`: {
        const ln = lns.shift()

        if (stripBackslash) {
          html.push(codeFence)
        } else {
          html.push(ln)
        }

        html.push('\n')
      }
        break

      default: {
        let ln = lns.shift()

        if (stripBackslash && (ln.startsWith('\\# ') || ln.startsWith('\\- '))) {
          ln = ln.substring(1)
        }

        const p = templates.paragraph(inline(ln))

        if (p != null) {
          html.push(p)

          html.push('\n')
        } else {
          html.push('\n')
        }
      }
    }
  }

  return html
}

export const getSegments = (all) => {
  if (all.startsWith('/')) all = all.substring(1)

  if (all.endsWith('/')) all = all.substring(0, all.length - 1)

  let lastSlashIndex = all.lastIndexOf('/')

  if (lastSlashIndex === -1) lastSlashIndex = all.length

  const initial = all.substring(0, lastSlashIndex)

  const last = all.substring(lastSlashIndex + 1)

  return {
    initial,
    last,
    all
  }
}
