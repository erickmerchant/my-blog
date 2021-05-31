const codeFence = '```'

export const createContentView = ({templates, publicFacing = true}) => {
  const inline = (ln) => {
    if (ln === '') return []

    if (publicFacing) {
      let index = 0

      ln = ln.replace(/["']/g, (match) => {
        if (match === "'") return 'ʼ'

        if (index++ % 2) {
          return '”'
        }

        return '“'
      })
    }

    const results = []
    const matches = ln.matchAll(/\[(.*?)\]\((.*?)\)|`(.*?)`/g)
    let offset = 0

    for (const match of matches) {
      results.push(ln.substring(offset, match.index))

      if (match[1] != null) {
        results.push(templates.anchor(match[1], match[2]))
      }

      if (match[3] != null) {
        results.push(templates.codeInline(match[3]))
      }

      offset = match.index + match[0].length
    }

    results.push(ln.substring(offset))

    return results
  }

  return (str) => {
    const lns = str.split('\n')
    const result = []
    let items
    let code
    let p

    while (lns.length) {
      let ln = lns.shift()

      items = []

      while (ln.startsWith('- ')) {
        items.push(templates.listItem(inline(ln.substring(2))), '\n')

        ln = lns.shift()
      }

      if (items.length) {
        result.push(templates.list(items))
      }

      switch (true) {
        case ln.startsWith('# '):
          {
            const text = ln.substring(2)
            result.push(templates.heading(text), '\n')
          }
          break

        case ln === codeFence:
          code = []
          while (lns[0] != null && lns[0] !== codeFence) {
            code.push(templates.codeBlockLine(lns.shift()), '\n')
          }
          result.push(templates.codeBlock(code, {isClosed: lns.length}), '\n')
          lns.shift()
          break

        default:
          p = templates.paragraph(inline(ln))

          if (p != null) {
            result.push(p)
          }

          result.push('\n')
      }
    }

    return result
  }
}

export const dateUtils = {
  stringToDate(str) {
    const [year, month, day] = str.split('-').map((v) => Number(v))

    const date = new Date(year, month - 1, day)

    return date
  },

  prettyDate(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
