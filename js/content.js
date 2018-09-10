const fetch = require('./fetch.js')
const { link } = require('@erickmerchant/router')()
const posthtml = require('posthtml')
const path = require('path')
const prism = require('prismjs')
const filterDrafts = process.env.NODE_ENV === 'production'

module.exports = {
  async list () {
    let posts = await fetch('/posts/index.json')

    posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

    return {
      location: '/posts/',
      title: 'Posts',
      posts
    }
  },

  async item (search) {
    let posts = await fetch('/posts/index.json')

    posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

    const index = posts.findIndex((post) => link('/posts/:slug/', post) === link('/posts/:slug/', search))

    const post = posts[index]

    const content = await fetch(`${link('/posts/html/:slug', post)}.html`)

    const result = await posthtml([
      (tree, cb) => {
        const promises = []

        tree.match({ tag: 'pre' }, (node) => {
          node.content = node.content.map((n) => typeof n === 'string' ? n.trim() : n)

          return tree.match.call(node, { tag: 'code' }, (node) => {
            const lang = node.attrs != null && node.attrs.class != null ? node.attrs.class.match(/language-(.*)/) : null
            const src = node.attrs != null ? node.attrs.src : null

            if (src != null) {
              delete node.attrs.src

              promises.push(fetch(path.join('/posts/html/', src)).then(highlight))
            } else {
              highlight(node.content[0])
            }

            return node

            function highlight (content) {
              if (lang != null && prism.languages[lang[1]]) {
                node.content = prism.highlight(content, prism.languages[lang[1]])
              } else {
                node.content = content.trim()
              }
            }
          })
        })

        Promise.all(promises).then(() => { cb(null, tree) })
      }
    ])
      .process(content)

    post.html = result.html

    return {
      location: link('/posts/:slug/', post),
      title: `Posts | ${post.title}`,
      next: posts[index - 1],
      previous: posts[index + 1],
      post
    }
  }
}
