const codeFence = '```'

export const createContentView = ({templates, publicFacing = true}) => {
  const inline = (ln) => {
    if (ln !== '' && publicFacing) {
      let index = 0

      ln = ln.replace(/["']/g, (match) => {
        if (match === "'") return 'ʼ'

        if (index++ % 2) {
          return '”'
        }

        return '“'
      })
    }

    if (ln === '') return []

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
    const result = []
    const lns = {
      *get() {
        let ln = ''
        let i = 0

        let char = str.charAt(i)

        do {
          if (char === '\n') {
            yield ln

            ln = ''
          } else {
            ln += char
          }

          char = str.charAt(++i)
        } while (char !== '')

        yield ln
      }
    }

    let items = []
    let code

    for (const ln of lns.get()) {
      if (code != null && ln !== codeFence) {
        if (ln.trim().startsWith('//')) {
          code.push(
            templates.codeBlockLine(templates.codeBlockComment(ln)),
            '\n'
          )
        } else {
          code.push(templates.codeBlockLine(ln), '\n')
        }
      } else {
        if (!ln.startsWith('- ') && items.length) {
          result.push(templates.list(items))

          items = []
        }

        switch (true) {
          case ln.startsWith('# '):
            {
              const text = ln.substring(2)
              result.push(
                templates.heading(
                  text,
                  text
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '-')
                ),
                '\n'
              )
            }
            break

          case ln.startsWith('- '):
            items.push(templates.listItem(inline(ln.substring(2))), '\n')
            break

          case ln === codeFence:
            if (code != null) {
              result.push(templates.codeBlock(code, {isClosed: true}), '\n')

              code = null
            } else {
              code = []
            }
            break

          default: {
            const p = templates.paragraph(inline(ln))

            if (p != null) {
              result.push(p)
            }

            result.push('\n')
          }
        }
      }
    }

    if (code != null) {
      result.push(templates.codeBlock(code, {isClosed: false}), '\n')
    }

    if (items.length) {
      result.push(templates.list(items))
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
