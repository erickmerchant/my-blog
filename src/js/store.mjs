import {route} from './router.mjs'
import content from './content.mjs'
import unfound from './404.mjs'

export const dispatchLocation = (commit, location) => {
  const scrollWindow = () => {
    setTimeout(() => window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    }), 10)
  }

  const commitPost = (post, location) => {
    commit((state) => {
      if (location) {
        post.location = location
      }

      return post
    })

    scrollWindow()
  }

  const commitUnfound = () => {
    commit(() => unfound)

    scrollWindow()
  }

  const errorHandler = (error) => {
    commit((state) => {
      return {
        location: '/500.html',
        title: '500 Error',
        error
      }
    })

    scrollWindow()
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
