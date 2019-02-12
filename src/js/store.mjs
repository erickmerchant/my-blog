import {route} from './router.mjs'
import content from './content.mjs'
import unfound from './404.mjs'

export const dispatchLocation = (commit, location) => {
  const commitPost = (post, location) => {
    commit((state) => {
      if (location) {
        post.location = location
      }

      return post
    })
  }

  const commitUnfound = () => {
    commit(() => unfound)
  }

  const errorHandler = (error) => {
    commit((state) => {
      return {
        location: '/500.html',
        title: '500 Error',
        error
      }
    })
  }

  route(location, (on) => {
    on('/posts/:slug/', (params) => content.item(params)
      .then(commitPost)
      .catch(errorHandler))

    on('/', () => content.list()
      .then(({posts}) => {
        if (!posts.length) {
          commitUnfound()
        } else {
          content.item(posts[0]).then(commitPost)
        }
      })
      .catch(errorHandler))

    on(() => {
      commitUnfound()
    })
  })
}
