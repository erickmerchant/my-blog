import {route} from './router.mjs'
import content from './content.mjs'
import unfound from './404.mjs'

export const dispatchLocation = (commit, location) => {
  const request = route(location, (on) => {
    on('/posts/:slug/', (params) => content.item(params))

    on('/', () => content.list()
      .then(({posts}) => {
        if (!posts.length) {
          return unfound
        }

        return content.item(posts[0])
      }))

    on(() => unfound)
  })

  request
    .then((result) => {
      commit(() => result)
    })
    .catch((error) => {
      commit(() => {
        return {
          location: '/500.html',
          title: '500 Error',
          error
        }
      })
    })
}
