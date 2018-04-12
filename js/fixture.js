const api = require('./api.js')

const unfound = {
  location: '/404.html',
  title: '404 Not Found'
}

module.exports = function (commit) {
  api.postsList()
    .then(function (posts) {
      if (posts.posts.length) {
        posts.posts.forEach((post) => {
          api.postsItem(post.slug)
            .then(function (post) {
              commit(function (state) {
                return post
              })
            })
        })

        api.postsItem(posts.posts[0].slug)
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

  return function () {}
}
