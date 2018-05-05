const fetch = require('./fetch.js')
const prism = require('prismjs')
const md = require('markdown-it')({
  highlight (str, lang) {
    if (prism.languages[lang]) {
      return prism.highlight(str, prism.languages[lang])
    }

    return md.utils.escapeHtml(str)
  }
})

module.exports = {
  list () {
    return fetch('/content/index.json')
      .then((posts) => {
        return {
          location: '/posts/',
          title: 'Posts',
          posts
        }
      })
  },

  item (search) {
    return fetch('/content/index.json')
      .then((posts) => {
        const index = posts.findIndex((post) => post.slug === search.slug && post.categories.join('/') === search.categories.join('/'))

        return fetch(`/content/${posts[index].link}`)
          .then((post) => {
            post.content = md.render(post.content)

            return {
              location: `/posts/${post.slug}/`,
              title: `Posts | ${post.title}`,
              post,
              next: posts[index - 1],
              previous: posts[index + 1]
            }
          })
      })
  }
}
