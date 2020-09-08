const unfound = {
  route: 'error',
  title: 'Page Not Found',
  error: Error(
    "That page doesn't exist. It was either moved, removed, or never existed."
  )
}

export const initialState = {route: '', title: ''}

export const dispatchLocation = async ({app, postModel, segments}) => {
  const posts = await postModel.getAll()

  let post

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
        post
      })
    } else {
      app.commit(unfound)
    }
  } catch (error) {
    app.commit({
      route: 'error',
      title: '500 Error',
      error
    })
  }
}

export const setupApp = ({app, postModel, getSegments}) => {
  window.onpopstate = () => {
    dispatchLocation({
      app,
      postModel,
      segments: getSegments(document.location.pathname)
    })
  }

  dispatchLocation({
    app,
    postModel,
    segments: getSegments(document.location.pathname)
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
