const content = require('./content.js')
const { route } = require('@erickmerchant/router')()
const unfound = require('./404.js')

module.exports = (commit) => {
  return {
    location (val) {
      route(val, (on) => {
        on('/posts/:slug/', async (params) => {
          try {
            const post = await content.item(params)

            commit((state) => {
              return post
            })
          } catch (err) {
            errorHandler(err)
          }
        })

        on('/', async () => {
          try {
            const { posts } = await content.list()

            if (!posts.length) {
              commit(() => {
                return unfound
              })
            } else {
              const post = await content.item(posts[0])

              commit((state) => {
                post.location = '/'

                return post
              })
            }
          } catch (err) {
            errorHandler(err)
          }
        })

        on(async () => {
          commit(() => {
            return unfound
          })

          return true
        })
      })
    }
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
