const content = require('./content.js')
const unfound = require('./404.js')

module.exports = (commit) => {
  content.list()
    .then((posts) => {
      if (posts.posts.length) {
        for (let post of posts.posts) {
          content.item(post)
            .then((post) => {
              commit((state) => {
                return post
              })
            })
        }

        content.item(posts.posts[0])
          .then((post) => {
            commit((state) => {
              post.location = '/'

              return post
            })
          })
      }
    })

  commit(() => {
    return unfound
  })

  return () => {}
}
