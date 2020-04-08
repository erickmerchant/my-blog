import {render, domUpdate, html, raw} from '@erickmerchant/framework'
import {route} from '@erickmerchant/router/wildcard.mjs'
import {classes} from './css/styles.mjs'

const headers = {'Content-Type': 'application/json'}

const state = {location: '', title: ''}

const target = document.querySelector('body')

const update = domUpdate(target)

const postsPromise = fetch('/content/posts/index.json', {headers}).then((res) => res.json())

const unfound = {
  location: '/404.html',
  title: 'Page Not Found',
  error: Error('That page doesn\'t exist. It was either moved, removed, or never existed.')
}

const listPosts = async () => {
  const posts = await postsPromise

  return {
    location: '/posts/',
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

  const response = await fetch(`/content/posts/${post.slug}.json`, {headers})

  const result = await response.json()

  const lns = result.content.split(/\n```.*\n/g)

  const content = []

  let i = 0

  while (i < lns.length) {
    if (i % 2) {
      content.push(html`<pre><code>${lns[i]}</code></pre>`)
    } else {
      content.push(raw(lns[i]))
    }

    i++
  }

  post.content = content

  return {
    location: `/posts/${post.slug}/`,
    title: `Posts | ${post.title}`,
    next: posts[index - 1],
    prev: posts[index + 1],
    post
  }
}

const dispatchLocation = async (commit, location) => {
  let state

  try {
    state = await route(location, (on) => {
      on('/posts/*/', async ([search]) => {
        const post = await getPost(search)

        return post
      })

      on('/', async () => {
        const {posts} = await listPosts()

        if (!posts.length) {
          return unfound
        }

        const post = await getPost(posts[0].slug)

        return post
      })

      on(async () => unfound)
    })
  } catch (error) {
    state = {
      location: '/500.html',
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
          <li class=${classes.listItem}><a ${anchorAttrs('/')}>Erick Merchant</a></li>
          <li class=${classes.listItem}><a href="https://github.com/erickmerchant">Projects</a></li>
        </ul>
      </nav>
    </header>
    ${route(state.location, (on) => {
      on('/posts/*/', () => html`<article class=${classes.main}>
        <header>
          <h1>${state.post.title}</h1>
          <time class=${classes.date} datetime=${new Date(state.post.date).toISOString()}>
            <svg viewBox="0 0 32 32" class=${classes.dateIcon}>
              <rect width="32" height="6" rx="0.5" />
              <rect width="32" height="22" y="8" rx="0.5" />
              <rect width="8" height="8" y="12" x="20" rx="0.5" fill="white" />
            </svg>
            <span>
              ${new Date(state.post.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
            </span>
          </time>
        </header>
        <div class=${classes.content}>${state.post.content}</div>
        ${state.prev || state.next
          ? html`<nav>
            <ul class=${classes.list}>
              <li class=${state.prev ? classes.button : classes.buttonDisabled}>${state.prev ? paginationLink(state.prev.slug, 'Older') : null}</li>
              <li class=${state.next ? classes.button : classes.buttonDisabled}>${state.next ? paginationLink(state.next.slug, 'Newer') : null}</li>
            </ul>
          </nav>`
          : null
        }
      </article>`)

      on(() => html`<section class=${classes.main}>
        <h1>${state.title}</h1>
        <p>${state.error != null ? state.error.message : ''}</p>
      </section>`)
    })}
    <footer class=${classes.footer}>
      <ul class=${classes.footerList}>
        <li class=${classes.listItem}><a href="https://github.com/erickmerchant/my-blog">View Source</a></li>
        <li class=${classes.listItem}>${raw('&copy;')} ${new Date().getFullYear()} Erick Merchant</li>
      </ul>
    </footer>
  </body>`
}

const commit = render({state, update, component})

window.onpopstate = () => {
  dispatchLocation(commit, document.location.pathname)
}

dispatchLocation(commit, document.location.pathname)
