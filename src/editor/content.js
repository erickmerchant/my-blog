export const createContentView = ({templates = false} = {}) => {
  const inline = (ln) => {
    if (!ln) return []

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
    const results = []

    let items, code

    while (lns.length) {
      let ln = lns.shift()

      items = []

      while (ln && ln.startsWith('- ')) {
        items.push(inline(ln.substring(2)), '\n')

        ln = lns.shift()
      }

      if (items.length) {
        results.push(templates.list(items))
      }

      if (ln === '```') {
        code = []

        while (lns[0] != null && lns[0] !== '```') {
          code.push(lns.shift(), '\n')
        }

        results.push(templates.codeBlock(code, !!lns.length), '\n')

        lns.shift()

        ln = lns.shift()
      }

      if (ln && ln.startsWith('# ')) {
        const text = ln.substring(2)

        results.push(templates.heading(text), '\n')
      } else {
        const items = inline(ln)

        results.push(templates.paragraph(items), '\n')
      }
    }

    return results
  }
}
