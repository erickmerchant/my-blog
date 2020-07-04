const codeFence = '```'

export const contentComponent = (str, templates, stripBackslash = true) => {
  const inline = (ln) => {
    if (ln === '') return []

    const results = []
    const matches = ln.matchAll(/\[(.*?)\]\((.*?)\)|`(.*?)`|\*(.*?)\*/g)
    let offset = 0

    for (const match of matches) {
      let unescaped = true

      if (
        match.index > 0 &&
        ln.substring(match.index - 1, match.index) === '\\'
      ) {
        unescaped = false

        if (
          match.index > 1 &&
          ln.substring(match.index - 2, match.index) === '\\\\'
        ) {
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

      case lns[0].startsWith('- '):
        {
          const items = []

          while (lns.length && lns[0].startsWith('- ')) {
            items.push(templates.listItem(inline(lns.shift().substring(2))))
            items.push('\n')
          }

          html.push(templates.list(items))
        }
        break

      case lns[0] === codeFence:
        {
          lns.shift()

          const code = []

          while (lns.length && lns[0] !== codeFence) {
            code.push(lns.shift())
            code.push('\n')
          }

          const close = lns.shift()

          html.push(
            templates.codeBlock(inline(code.join('')), close === codeFence)
          )
          html.push('\n')
        }
        break

      case lns[0] === `\\${codeFence}`:
        {
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

        if (
          stripBackslash &&
          (ln.startsWith('\\# ') || ln.startsWith('\\- '))
        ) {
          ln = ln.substring(1)
        }

        const p = templates.paragraph(inline(ln))

        if (p != null) {
          html.push(p)
        }

        html.push('\n')
      }
    }
  }

  return html
}

export const getSegments = (all) => {
  if (all.startsWith('/')) all = all.substring(1)

  if (all.endsWith('/')) all = all.substring(0, all.length - 1)

  let lastSlashIndex = all.lastIndexOf('/')

  if (!~lastSlashIndex) lastSlashIndex = all.length

  const initial = all.substring(0, lastSlashIndex)

  const last = all.substring(lastSlashIndex + 1)

  return {
    initial,
    last,
    all
  }
}

export const prettyDate = (str) => {
  const [year, month, day] = str.split('-').map((v) => Number(v))

  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
