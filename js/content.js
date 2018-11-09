const fetch = require('./fetch.js')
const { link } = require('@erickmerchant/router')()
const unfound = require('./404.js')
const prism = require('prismjs')
const goat = require('escape-goat')
const filterDrafts = typeof window === 'undefined'
const codeStart = '```'

module.exports = {
  list () {
    return fetch('/_posts/index.json').then((posts) => {
      posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

      return {
        location: '/posts/',
        title: 'Posts',
        posts
      }
    })
  },

  item (search) {
    return fetch('/_posts/index.json').then((posts) => {
      posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

      const index = posts.findIndex((post) => link('/posts/:slug/', post) === link('/posts/:slug/', search))

      if (index < 0) {
        return unfound
      }

      const post = posts[index]

      return fetch(`${link('/_posts/:slug', post)}.md`).then((result) => {
        const lns = result.split('\n')
        const html = []

        while (lns.length) {
          const ln = lns.shift()

          if (ln.startsWith(codeStart)) {
            let code = []

            const lang = ln.substring(3).trim()

            while (lns[0] != null && !lns[0].startsWith(codeStart)) {
              code.push(lns.shift())
            }

            lns.shift()

            code = code.join('\n')

            if (lang) {
              code = prism.highlight(code, prism.languages[lang])
            } else {
              code = goat.escape(code)
            }

            html.push(`<pre><code>${code}</code></pre>`)
          } else {
            html.push(ln)
          }
        }

        post.html = html.join('\n')

        return {
          location: link('/posts/:slug/', post),
          title: `Posts | ${post.title}`,
          next: posts[index - 1],
          previous: posts[index + 1],
          post
        }
      })
    })
  }
}
