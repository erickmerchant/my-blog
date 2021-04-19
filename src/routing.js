export const getRoute = (all, routes) => {
  for (const [key, regex] of Object.entries(routes)) {
    const match = all.match(regex)

    if (match) {
      return {
        key,
        params: match.slice(1)
      }
    }
  }
}

const getDispatchLocation = ({app, postsModel}) => async (
  pathname,
  hash = ''
) => {
  if (pathname === app.state?.pathname) return

  const route = getRoute(pathname, {
    post: /^\/?(?:posts\/([a-z0-9-]+)|)\/?$/
  }) || {key: 'error'}

  let state = {
    route: {key: 'error'},
    wrapCode: app.state.wrapCode,
    pathname,
    title: 'Page Not Found',
    message:
      "That page doesn't exist. It was either moved, removed, or never existed."
  }

  if (route.key === 'post') {
    try {
      const [id] = route.params

      const post = await postsModel.getBySlug(id)

      if (post != null) {
        state = {
          route,
          wrapCode: app.state.wrapCode,
          pathname,
          title: `Posts | ${post.title}`,
          post
        }
      }
    } catch (error) {
      if (!error.message.startsWith('404')) {
        state = {
          route: {key: 'error'},
          wrapCode: app.state.wrapCode,
          pathname,
          title: 'Error Caught',
          message: error.message
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

export const setupRouting = ({app, postsModel}) => {
  const dispatchLocation = getDispatchLocation({app, postsModel})

  window.onpopstate = (e) => {
    dispatchLocation(window.location.pathname, window.location.hash)
  }

  dispatchLocation(window.location.pathname, window.location.hash)

  return (href) => {
    return {
      href,
      onclick(e) {
        e.preventDefault()

        window.history.pushState({}, null, href)

        dispatchLocation(href)
      }
    }
  }
}
