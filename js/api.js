const fs = require('fs')
const prism = require('prismjs')
const md = require('markdown-it')({
  highlight (str, lang) {
    if (prism.languages[lang]) {
      return prism.highlight(str, prism.languages[lang])
    }

    return md.utils.escapeHtml(str)
  }
})

let fetch

if (typeof window !== 'undefined') {
  fetch = function (url) {
    return window.fetch(url).then((response) => response.json())
  }
} else {
  fetch = function (url) {
    return new Promise(function (resolve, reject) {
      fs.readFile('./build' + url, 'utf8', function (err, response) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(response))
        }
      })
    })
  }
}

module.exports = {
  postsList () {
    return fetch('/content/index.json')
      .then((posts) => {
        return {
          location: '/posts/',
          title: 'Posts',
          posts
        }
      })
  },

  postsItem (slug) {
    return fetch('/content/index.json')
      .then((posts) => {
        const index = posts.findIndex((post) => post.slug === slug)

        return fetch(`/content/${slug}.json`)
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
