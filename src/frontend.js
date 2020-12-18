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
  return {route: '', title: ''}
}

export const getDispatchLocation = ({app, postModel, getSegments}) => async (
  location,
  transitioning = true
) => {
  const segments = getSegments(location)

  const posts = await postModel.getAll()

  let post

  if (transitioning) {
    app.commit((state) => {
      state.transitioning = true
    })
  }

  try {
    if (segments.initial === 'posts') {
      post = await postModel.getBySlug(segments.last)
    } else if (segments.all === '' && posts.length > 0) {
      post = await postModel.getBySlug()
    }

    if (post != null) {
      app.commit({
        route: 'post',
        title: `Posts | ${post.title}`,
        transitioning: false,
        post
      })
    } else {
      app.commit(getUnfound())
    }
  } catch (error) {
    app.commit({
      route: 'error',
      title: '500 Error',
      transitioning: false,
      error
    })
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
