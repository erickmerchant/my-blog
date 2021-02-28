export const getInitialState = () => {
  return {route: null, title: ''}
}

export const getDispatchLocation = ({app, postsModel, getSegments}) => async (
  location,
  transitioning = true
) => {
  if (location === app.state?.location) return

  const segments = getSegments(location)
  let state = {
    route: 'error',
    location,
    title: 'Page Not Found',
    error: Error(
      "That page doesn't exist. It was either moved, removed, or never existed."
    ),
    transitioning: false
  }

  if (transitioning) {
    app.state.transitioning = true
  }

  if (segments.initial === 'posts' || segments.all === '') {
    try {
      let id

      if (segments.initial === 'posts') {
        id = segments.last
      }

      const post = await postsModel.getBySlug(id)

      if (post != null) {
        state = {
          route: 'post',
          location,
          title: `Posts | ${post.title}`,
          transitioning: false,
          post
        }
      }
    } catch (error) {
      if (!error.message.startsWith('404')) {
        state = {
          route: 'error',
          location,
          title: 'Error',
          transitioning: false,
          error
        }
      }
    }
  }

  if (location !== app.state?.location) {
    app.state = state

    window.scroll(0, 0)
  }
}

export const setupApp = ({dispatchLocation}) => {
  window.onpopstate = (e) => {
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
    }
  }
}
