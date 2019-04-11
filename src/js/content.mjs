/* global window */

import {link} from './router.mjs'
import fetch from './fetch.mjs'
import unfound from './404.mjs'

const filterDrafts = typeof window === 'undefined'
const codeDelim = '```'
const postsPromise = fetch('/content/posts/index.json')

export default {
  list() {
    return postsPromise.then((posts) => {
      posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

      return {
        location: '/posts/',
        title: 'Posts',
        posts
      }
    })
  },

  item(search) {
    return postsPromise.then((posts) => {
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
          const code = []

          if (ln.startsWith(codeDelim)) {
            while (lns[0] != null && !lns[0].startsWith(codeDelim)) {
              code.push(lns.shift())
            }

            lns.shift()

            const lang = ln.substring(3).trim() || null

            const escaped = code
              .join('\n')
              .replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')

            const highlighted = lang != null
              ? escaped
                .replace(/([^\w]|^)(async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|finally|for|function|if|import|in|instanceof|let|new|return|super|switch|this|throw|try|typeof|var|void|while|with|yield|require|module|exports)([^\w]|$)/g, '$1<span class="keyword">$2</span>$3')
                .replace(/([^\w]|^)(true|false)([^\w]|$)/g, '$1<span class="boolean">$2</span>$3')
                .replace(/([^\w]|^)(null|undefined)([^\w]|$)/g, '$1<span class="$2">$2</span>$3')
                .replace(/(\s)-?(\d+\.\d+|\d+|\.\d+)(\s)/g, '$1<span class="number">$2</span>$3')
                .replace(/([^\w]|^)(\w+)\(/g, '$1<span class="function-call">$2</span>(')
                .replace(/(`(.|\n)*?`)/g, '<span class="string">$1</span>')
                .replace(/(&#39;|&quot;)(.*?)\1/g, '<span class="string">$1$2$1</span>')
                .replace(/(\/\*(.|\n)*?\*\/)/g, '<span class="comment">$1</span>')
                .replace(/(\s)\/\/(.*?)/g, '$1<span class="comment">//$2</span>')
              : escaped

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
