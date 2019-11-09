import {link} from './router.mjs'
import fetch from './fetch.mjs'
import unfound from './404.mjs'
import {view, safe} from '@erickmerchant/framework'

const {pre} = view()
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
        const content = []
        let html = ''

        while (lns.length) {
          const ln = lns.shift()
          const code = []

          if (ln.startsWith(codeDelim)) {
            if (html) {
              content.push(safe(html))

              html = ''
            }

            while (lns[0] != null && !lns[0].startsWith(codeDelim)) {
              code.push(lns.shift())
            }

            lns.shift()

            content.push(pre`<pre><code>${code.join('\n')}</code></pre>`)
          } else {
            html += ln
          }
        }

        if (html) {
          content.push(safe(html))
        }

        post.content = content

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
