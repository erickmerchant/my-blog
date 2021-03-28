export const getDispatchLocation = ({app, postsModel, getRoute}) => async (
  pathname,
  hash = ''
) => {
  if (pathname === app.state?.pathname) return

  const route = getRoute(pathname, {
    post: /^\/?(?:posts\/([a-z0-9-]+)|)\/?$/
  }) || {key: 'error'}

  let state = {
    route: {key: 'error'},
    pathname,
    title: 'Page Not Found',
    error: Error(
      "That page doesn't exist. It was either moved, removed, or never existed."
    )
  }

  if (route.key === 'post') {
    try {
      const [id] = route.params

      const post = await postsModel.getBySlug(id)

      if (post != null) {
        state = {
          route,
          pathname,
          title: `Posts | ${post.title}`,
          post
        }
      }
    } catch (error) {
      if (!error.message.startsWith('404')) {
        state = {
          route: {key: 'error'},
          pathname,
          title: 'Error',
          error
        }
      }
    }
  }

  if (pathname !== app.state?.pathname) {
    app.state = state
  }

  await Promise.resolve()

  if (hash) {
    document.querySelector(hash)?.scrollIntoView()
  } else {
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
