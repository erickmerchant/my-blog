import {link} from './router.mjs'
import fetch from './fetch.mjs'
import unfound from './404.mjs'

const codeDelim = '```'
const postsPromise = fetch('/content/posts/index.json')

export default {
  list() {
    return postsPromise.then((posts) => {
      posts = posts.sort((a, b) => b.date - a.date)

      return {
        location: '/posts/',
        title: 'Posts',
        posts
      }
    })
  },

  item(search) {
    return postsPromise.then((posts) => {
      posts = posts.sort((a, b) => b.date - a.date)

      const index = posts.findIndex((post) => link('/posts/:slug/', post) === link('/posts/:slug/', search))

      if (index < 0) {
        return unfound
      }

      const post = posts[index]

      return fetch(`${link('/content/posts/:slug', post)}.md`).then((result) => {
        const lns = result.split('\n')
        const html = []

        while (lns.length) {
          const ln = lns.shift()
          const code = []

          if (ln.startsWith(codeDelim)) {
            while (lns[0] != null && !lns[0].startsWith(codeDelim)) {
              code.push(lns.shift())
            }

            lns.shift()

            const escaped = code
              .join('\n')
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')

            html.push(`<pre><code>${escaped}</code></pre>`)
          } else {
            html.push(ln)
          }
        }

        post.html = html.join('\n')

        return {
          location: link('/posts/:slug/', post),
          title: `Posts | ${post.title}`,
          next: posts[index - 1],
          prev: posts[index + 1],
          post
        }
      })
    })
  }
}
