import {render, domUpdate, html} from '@erickmerchant/framework'
import {classes} from './css/styles.mjs'
import {content, getSegments} from './common.mjs'

const fetchOptions = {headers: {'Content-Type': 'application/json'}, mode: 'no-cors'}

const state = {route: '', title: ''}

const target = document.querySelector('body')

const update = domUpdate(target)

const postsPromise = fetch('/content/posts/index.json', fetchOptions).then((res) => res.json())

const unfound = {
  route: 'error',
  title: 'Page Not Found',
  error: Error('That page doesn\'t exist. It was either moved, removed, or never existed.')
}

const listPosts = async () => {
  const posts = await postsPromise

  return {
    title: 'Posts',
    posts
  }
}

const getPost = async (search) => {
  const posts = await postsPromise

  const index = posts.findIndex((post) => post.slug === search)

  if (index === -1) {
    return unfound
  }

  const post = posts[index]

  const response = await fetch(`/content/posts/${post.slug}.json`, fetchOptions)

  const result = await response.json()

  post.content = result.content

  return {
    route: 'post',
    title: `Posts | ${post.title}`,
    next: posts[index - 1],
    prev: posts[index + 1],
    post
  }
}

const dispatchLocation = async (commit, location) => {
  const segments = getSegments(location)

  let state = unfound

  try {
    if (segments.initial === 'posts') {
      state = await getPost(segments.last)
    } else if (segments.all === '') {
      const {posts} = await listPosts()

      if (posts.length) {
        state = await getPost(posts[0].slug)
      }
    }
  } catch (error) {
    state = {
      route: 'error',
      title: '500 Error',
      error
    }
  }

  commit(() => state)
}

const component = ({state, commit}) => (afterUpdate) => {
  const anchorAttrs = (href) => {
    return {
      href,
      onclick(e) {
        e.preventDefault()

        window.history.pushState({}, null, href)

        dispatchLocation(commit, href)
      }
    }
  }

  afterUpdate(() => {
    window.scroll(0, 0)
  })

  const paginationLink = (slug, text) => html`<a ${anchorAttrs(`/posts/${slug}/`)} class=${classes.buttonAnchor}>${text}</a>`

  return html`<body class=${classes.app}>
    <header>
      <nav class=${classes.topNav}>
        <ul class=${classes.topNavList}>
          <li class=${classes.navListItem}><a class=${classes.navAnchor} ${anchorAttrs('/')}>Erick Merchant</a></li>
          <li class=${classes.navListItem}><a class=${classes.navAnchor} href="https://github.com/erickmerchant">Projects</a></li>
        </ul>
      </nav>
    </header>
    ${() => {
      if (state.route === 'post') {
        return html`<article class=${classes.main}>
          <header>
            <h1 class=${classes.heading1}>${state.post.title}</h1>
            <time class=${classes.date} datetime=${new Date(state.post.date).toISOString()}>
              <svg viewBox="0 0 32 32" class=${classes.dateIcon}>
                <rect width="32" height="6" rx="0.5" />
                <rect width="32" height="22" y="8" rx="0.5" />
                <rect width="8" height="8" y="12" x="20" rx="0.5" fill="white" />
              </svg>
              <span>
                ${new Date(state.post.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'})}
              </span>
            </time>
          </header>
          ${content(state.post.content)}
          ${state.prev || state.next
            ? html`<nav>
              <ul class=${classes.navList}>
                <li class=${state.prev ? classes.button : classes.buttonDisabled}>${state.prev ? paginationLink(state.prev.slug, 'Older') : null}</li>
                <li class=${state.next ? classes.button : classes.buttonDisabled}>${state.next ? paginationLink(state.next.slug, 'Newer') : null}</li>
              </ul>
            </nav>`
            : null
          }
        </article>`
      }

      return html`<section class=${classes.main}>
        <h1 class=${classes.heading1}>${state.title ?? ''}</h1>
        <p class=${classes.paragraph}>${state.error?.message ?? ''}</p>
      </section>`
    }}
    <footer class=${classes.footer}>
      <ul class=${classes.footerList}>
        <li class=${classes.navListItem}><a class=${classes.navAnchor} href="https://github.com/erickmerchant/my-blog">View Source</a></li>
        <li class=${classes.navListItem}>© ${new Date().getFullYear()} Erick Merchant</li>
      </ul>
    </footer>
  </body>`
}

const commit = render({state, update, component})

window.onpopstate = () => {
  dispatchLocation(commit, document.location.pathname)
}

dispatchLocation(commit, document.location.pathname)
