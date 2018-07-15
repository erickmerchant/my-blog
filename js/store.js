const content = require('./content.js')
const {route} = require('@erickmerchant/router')()
const unfound = require('./404.js')

module.exports = function (commit) {
  return {
    location (val) {
      route(val, function (on) {
        on('/:categories*/:slug/', function (params) {
          return content.item(params)
            .then(function (post) {
              commit(function (state) {
                return post
              })
            })
            .catch(errorHandler)
        })

        on('/', function () {
          return content.list()
            .then(function ({posts}) {
              if (!posts.length) {
                commit(function () {
                  return unfound
                })
              } else {
                content.item(posts[0])
                  .then(function (post) {
                    commit(function (state) {
                      post.location = '/'

                      return post
                    })
                  })
                  .catch(errorHandler)
              }
            })
            .catch(errorHandler)
        })

        on(function () {
          commit(function () {
            return unfound
          })

          return Promise.resolve(true)
        })
      })
    }
  }

  function errorHandler (error) {
    commit(function (state) {
      return {
        location: '500.html',
        title: '500 Error',
        error
      }
    })
  }
}
