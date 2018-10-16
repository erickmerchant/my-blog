const content = require('./content.js')
const { route } = require('@erickmerchant/router')()
const unfound = require('./404.js')

module.exports = (commit) => {
  return (val) => route(val, (on) => {
    on('/posts/:slug/', (params) => {
      return content.item(params)
        .then((post) => {
          commit((state) => {
            return post
          })
        })
        .catch(errorHandler)
    })

    on('/', () => {
      return content.list()
        .then(({ posts }) => {
          if (!posts.length) {
            commit(() => {
              return unfound
            })
          } else {
            return content.item(posts[0]).then((post) => {
              commit((state) => {
                post.location = '/'

                return post
              })
            })
          }
        })
        .catch(errorHandler)
    })

    on(() => {
      commit(() => {
        return unfound
      })

      return true
    })
  })

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
