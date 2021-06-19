const getDispatchLocation =
  ({app, postsModel}) =>
  async ({pathname, hash = ''}) => {
    if (pathname === app.state?.pathname && !import.meta.env?.DEV) return

    const match = pathname.match(/^\/?(?:posts\/([a-z0-9-]+)|)\/?$/)

    const state = {
      isLoading: false,
      pathname,
      post: {
        title: 'Page Not Found',
        content:
          "That page doesn't exist. It was either moved, removed, or never existed."
      }
    }

    if (match) {
      try {
        const [id] = match.slice(1)

        const post = await postsModel.getBySlug(id)

        if (post != null) {
          state.post = post
        }
      } catch (error) {
        if (!error.message.startsWith('404')) {
          state.post = {
            title: 'Error Caught',
            content: error.message
          }
        }
      }
    }

    if (pathname !== app.state?.pathname || import.meta.env?.DEV) {
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
    dispatchLocation(window.location)
  }

  dispatchLocation(window.location)

  return (href) => {
    return {
      href,
      '@click'(e) {
        e.preventDefault()

        window.history.pushState({}, null, href)

        dispatchLocation({pathname: href})
      }
    }
  }
}
