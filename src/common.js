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
  const lns = {
    *[Symbol.iterator]() {
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

  for (const ln of lns) {
    if (code != null && ln !== codeFence) {
      code.push(ln)
      code.push('\n')
    } else {
      if (!ln.startsWith('- ') && items.length) {
        html.push(templates.list(items))

        items = []
      }

      switch (true) {
        case ln.startsWith('# '):
          html.push(templates.heading(ln.substring(2)))
          html.push('\n')
          break

        case ln.startsWith('- '):
          items.push(templates.listItem(inline(ln.substring(2))))
          items.push('\n')
          break

        case ln === codeFence:
          if (code != null) {
            html.push(templates.codeBlock(inline(code.join('')), true))
            html.push('\n')

            code = null
          } else {
            code = []
          }
          break

        case ln === `\\${codeFence}`:
          if (stripBackslash) {
            html.push(codeFence)
          } else {
            html.push(ln)
          }

          html.push('\n')
          break

        default: {
          let l = ln

          if (
            stripBackslash &&
            (l.startsWith('\\# ') || l.startsWith('\\- '))
          ) {
            l = l.substring(1)
          }

          const p = templates.paragraph(inline(l))

          if (p != null) {
            html.push(p)
          }

          html.push('\n')
        }
      }
    }
  }

  if (code != null) {
    html.push(templates.codeBlock(inline(code.join('')), false))
    html.push('\n')
  }

  if (items.length) {
    html.push(templates.list(items))
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

export const createPostsModel = (fetch) => {
  return {
    getAll() {
      return fetch('/content/posts/index.json').then((res) => res.json())
    },

    async getBySlug(id) {
      const posts = await this.getAll()

      const index = id != null ? posts.findIndex((post) => post.slug === id) : 0

      if (~index) {
        const post = Object.assign({}, posts[index])

        const response = await fetch(`/content/posts/${post.slug}.json`)

        const content = await response.json()

        post.content = content

        post.next = posts[index - 1]

        post.prev = posts[index + 1]

        return post
      }
    }
  }
}
