import fetch from './fetch.mjs'
import router from '@erickmerchant/router'
import unfound from './404.mjs'

const { link } = router()
const filterDrafts = typeof window === 'undefined'
const codeDelim = '```'

export default {
  list () {
    return fetch('/content/posts/index.json').then((posts) => {
      posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

      return {
        location: '/posts/',
        title: 'Posts',
        posts
      }
    })
  },

  item (search) {
    return fetch('/content/posts/index.json').then((posts) => {
      posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

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
          let code = []

          if (ln.startsWith(codeDelim)) {
            // const lang = ln.substring(3).trim()

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

            const highlighted = escaped
              .replace(/(^|\s)(if|else|do|while|for|let|const|function|class|switch|case:)($|\s)/g, '$1<span class="keyword">$2</span>$3')
              .replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, '<span class="string">$1</span>')
              .replace(/(^|\s)(false|true)($|\s)/g, '$1<span class="boolean">$2</span>$3')
              .replace(/(^|\s)(null|undefined)($|\s)/g, '$1<span class="$2">$2</span>$3')
              .replace(/(^|\s)(-?[0-9.]+)($|\s)/g, '$1<span class="number">$2</span>$3')

            html.push(`<pre><code>${highlighted}</code></pre>`)
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
