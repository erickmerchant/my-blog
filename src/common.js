import {html} from '@erickmerchant/framework/main.js'

const codeFence = '```'

export const contentComponent = (
  str,
  classes,
  templates,
  publicFacing = true
) => {
  templates = Object.assign(
    {},
    {
      strong: (text) =>
        html`
          <strong class=${classes.strong}>${text}</strong>
        `,
      anchor: (text, href) =>
        html`
          <a class=${classes.anchor} href=${href}>${text}</a>
        `,
      list: (items) =>
        html`
          <ul class=${classes.list}>
            ${items}
          </ul>
        `,
      listItem: (items) =>
        html`
          <li class=${classes.listItem}>${items}</li>
        `,
      paragraph: (items) =>
        items.length
          ? html`
              <p class=${classes.paragraph}>${items}</p>
            `
          : null
    },
    templates
  )

  const quotes = (ln) => {
    if (ln === '' || !publicFacing) return ln

    let index = 0

    return ln.replace(/["']/g, (match) => {
      if (match === "'") return 'ʼ'

      if (index++ % 2) {
        return '”'
      }

      return '“'
    })
  }

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
          if (!publicFacing) continue

          results.push(`${ln.substring(offset, match.index - 1)}${match[0]}`)
        }
      }

      if (unescaped) {
        results.push(ln.substring(offset, match.index))

        if (match[1] != null) {
          results.push(templates.anchor(match[1], match[2]))
        }

        if (match[3] != null) {
          results.push(templates.codeInline(match[3]))
        }

        if (match[4] != null) {
          results.push(templates.strong(match[4]))
        }
      }

      offset = match.index + match[0].length
    }

    results.push(ln.substring(offset))

    return results
  }

  const result = []
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
      code.push(ln, '\n')
    } else {
      if (!ln.startsWith('- ') && items.length) {
        result.push(templates.list(items))

        items = []
      }

      switch (true) {
        case ln.startsWith('# '):
          result.push(templates.heading(ln.substring(2)), '\n')
          break

        case ln.startsWith('- '):
          items.push(templates.listItem(inline(quotes(ln.substring(2)))), '\n')
          break

        case ln === codeFence:
          if (code != null) {
            result.push(templates.codeBlock(inline(code.join('')), true), '\n')

            code = null
          } else {
            code = []
          }
          break

        case ln === `\\${codeFence}`:
          if (publicFacing) {
            result.push(codeFence)
          } else {
            result.push(ln)
          }

          result.push('\n')
          break

        default: {
          let l = ln

          if (publicFacing && (l.startsWith('\\# ') || l.startsWith('\\- '))) {
            l = l.substring(1)
          }

          const p = templates.paragraph(inline(quotes(l)))

          if (p != null) {
            result.push(p)
          }

          result.push('\n')
        }
      }
    }
  }

  if (code != null) {
    result.push(templates.codeBlock(inline(code.join('')), false), '\n')
  }

  if (items.length) {
    result.push(templates.list(items))
  }

  return result
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
