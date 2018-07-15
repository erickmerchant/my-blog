const content = require('./content.js')
const unfound = require('./404.js')

module.exports = function (commit) {
  content.list()
    .then(function (posts) {
      if (posts.posts.length) {
        for (let post of posts.posts) {
          content.item(post)
            .then(function (post) {
              commit(function (state) {
                return post
              })
            })
        }

        content.item(posts.posts[0])
          .then(function (post) {
            commit(function (state) {
              post.location = '/'

              return post
            })
          })
      }
    })

  commit(function () {
    return unfound
  })

  return {}
}
