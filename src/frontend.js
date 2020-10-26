const unfound = {
  route: 'error',
  title: 'Page Not Found',
  error: Error(
    "That page doesn't exist. It was either moved, removed, or never existed."
  ),
  transitioning: false
}

export const initialState = {route: '', title: ''}

export const dispatchLocation = async ({
  app,
  postModel,
  segments,
  transitioning = true
}) => {
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
      app.commit(unfound)
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

export const setupApp = ({app, postModel, getSegments}) => {
  window.onpopstate = () => {
    dispatchLocation({
      app,
      postModel,
      segments: getSegments(window.location.pathname)
    })
  }

  dispatchLocation({
    app,
    postModel,
    segments: getSegments(window.location.pathname),
    transitioning: false
  })
}

export const getAnchorAttrs = ({app, postModel, getSegments}) => (href) => {
  return {
    href,
    onclick(e) {
      e.preventDefault()

      window.history.pushState({}, null, href)

      dispatchLocation({app, postModel, segments: getSegments(href)})

      window.scroll(0, 0)
    }
  }
}
