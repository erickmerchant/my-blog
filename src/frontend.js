export const getDispatchLocation = ({app, postsModel, getRoute}) => async (
  location,
  transitioning = true
) => {
  if (location === app.state?.location) return

  const route = getRoute(location, {
    post: /^\/?(?:posts\/([a-z0-9-]+)|)\/?$/
  })

  let state = {
    route: {key: 'error'},
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

  if (route.key === 'post') {
    try {
      const [id] = route.params

      const post = await postsModel.getBySlug(id)

      if (post != null) {
        state = {
          route,
          location,
          title: `Posts | ${post.title}`,
          transitioning: false,
          post
        }
      }
    } catch (error) {
      if (!error.message.startsWith('404')) {
        state = {
          route: {key: 'error'},
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
