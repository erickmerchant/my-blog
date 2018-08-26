const fetch = require('./fetch.js')
const {link} = require('@erickmerchant/router')()
const posthtml = require('posthtml')
const unescape = require('unescape')
const prism = require('prismjs')
const filterDrafts = process.env.NODE_ENV === 'production'

module.exports = {
  list () {
    return fetch('/posts.json')
      .then(function (posts) {
        posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

        return {
          location: '/posts/',
          title: 'Posts',
          posts
        }
      })
  },

  item (search) {
    return fetch('/posts.json')
      .then(function (posts) {
        posts = posts.filter((post) => !filterDrafts || !post.draft).sort((a, b) => b.date - a.date)

        const index = posts.findIndex((post) => link('/posts/:slug/', post) === link('/posts/:slug/', search))

        const post = posts[index]

        return fetch(`${link('/posts/:slug', post)}.html`)
          .then(function (content) {
            return posthtml([
              function (tree) {
                tree.match({ tag: 'pre' }, function (node) {
                  return tree.match.call(node, { tag: 'code' }, function (node) {
                    const lang = node.attrs != null && node.attrs.class != null ? node.attrs.class.match(/language-(.*)/) : null
                    const content = node.content[0]

                    if (lang != null && prism.languages[lang[1]]) {
                      node.content = prism.highlight(unescape(content), prism.languages[lang[1]])
                    }

                    return node
                  })
                })
              }
            ])
              .process(content)
              .then(function (result) {
                post.content = result.html

                return {
                  location: link('/posts/:slug/', post),
                  title: `Posts | ${post.title}`,
                  next: posts[index - 1],
                  previous: posts[index + 1],
                  post
                }
              })
          })
      })
  }
}
