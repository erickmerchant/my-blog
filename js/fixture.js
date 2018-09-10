const content = require('./content.js')
const unfound = require('./404.js')

module.exports = (commit) => {
  content.list()
    .then(async (posts) => {
      if (posts.posts.length) {
        for (let post of posts.posts) {
          content.item(post)
            .then((post) => {
              commit((state) => {
                return post
              })
            })
        }

        const post = await content.item(posts.posts[0])

        commit((state) => {
          post.location = '/'

          return post
        })
      }
    })

  commit(() => {
    return unfound
  })

  return {}
}
