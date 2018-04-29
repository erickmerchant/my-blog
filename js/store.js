const content = require('./content.js')
const {route} = require('@erickmerchant/router')()

const unfound = {
  location: '/404.html',
  title: '404 Not Found'
}

module.exports = function (commit) {
  return function (action, val) {
    if (action === 'location') {
      route(val, function (on) {
        on('/posts/:slug/', function (params) {
          return content.item(params.slug)
            .then(function (post) {
              commit(function (state) {
                return post
              })
            })
        })

        on('/', function () {
          return content.list()
            .then(function ({posts}) {
              if (!posts.length) {
                commit(function () {
                  return unfound
                })
              } else {
                content.item(posts[0].slug)
                  .then(function (post) {
                    commit(function (state) {
                      post.location = '/'

                      return post
                    })
                  })
              }
            })
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
}
