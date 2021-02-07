const getUnfound = () => {
  return {
    route: 'error',
    title: 'Page Not Found',
    error: Error(
      "That page doesn't exist. It was either moved, removed, or never existed."
    ),
    transitioning: false
  }
}

export const getInitialState = () => {
  return {route: null, title: ''}
}

export const getDispatchLocation = ({app, postsModel, getSegments}) => async (
  location,
  transitioning = true
) => {
  const segments = getSegments(location)

  const posts = await postsModel.getAll()

  let post

  if (transitioning) {
    app.state.transitioning = true
  }

  try {
    if (segments.initial === 'posts') {
      post = await postsModel.getBySlug(segments.last)
    } else if (segments.all === '' && posts.length > 0) {
      post = await postsModel.getBySlug()
    }

    if (post != null) {
      app.state = {
        route: 'post',
        title: `Posts | ${post.title}`,
        transitioning: false,
        post
      }
    } else {
      app.state = getUnfound()
    }
  } catch (error) {
    app.state = {
      route: 'error',
      title: 'Error',
      transitioning: false,
      error
    }
  }
}

export const setupApp = ({dispatchLocation}) => {
  window.onpopstate = () => {
    dispatchLocation(window.location.pathname)
  }

  dispatchLocation(window.location.pathname, false)
}

export const getAnchorAttrs = ({dispatchLocation}) => (href) => {
  return {
    href,
    onclick(e) {
      e.preventDefault()

      window.history.pushState({}, null, href)

      dispatchLocation(href)

      window.scroll(0, 0)
    }
  }
}
