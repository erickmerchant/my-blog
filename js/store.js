const content = require('./content.js')
const { route } = require('@erickmerchant/router')()
const unfound = require('./404.js')

module.exports = (commit) => {
  return (val) => route(val, (on) => {
    on('/posts/:slug/', (params) => {
      return content.item(params)
        .then(commitPost)
        .catch(errorHandler)
    })

    on('/', () => {
      return content.list()
        .then(({ posts }) => {
          if (!posts.length) {
            commitUnfound()
          } else {
            return content.item(posts[0]).then(commitPost)
          }
        })
        .catch(errorHandler)
    })

    on(() => {
      commitUnfound()

      return true
    })
  })

  function commitPost (post, location) {
    commit((state) => {
      if (location) {
        post.location = location
      }

      return post
    })
  }

  function commitUnfound () {
    commit(() => {
      return unfound
    })
  }

  function errorHandler (error) {
    commit((state) => {
      return {
        location: '500.html',
        title: '500 Error',
        error
      }
    })
  }
}
