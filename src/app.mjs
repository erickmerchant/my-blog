import framework, {domUpdate, view, raw} from '@erickmerchant/framework'
import router from '@erickmerchant/router'

const postRoutePattern = '/posts/:slug/'
const {route, link} = router()
const {pre, site, article, liAnchor, liSpan, error} = view()

const fetch = async (url) => {
  const response = await window.fetch(url)

  if (url.endsWith('.json')) return response.json()

  return response.text()
}

const postsPromise = fetch('/content/posts/index.json')

const unfound = {
  location: '/404.html',
  title: 'Page Not Found',
  error: Error('That page doesn\'t exist. It was either moved, removed, or never existed.')
}

const listPosts = async () => {
  let posts = await postsPromise

  posts = posts.sort((a, b) => b.date - a.date)

  return {
    location: '/posts/',
    title: 'Posts',
    posts
  }
}

const getPost = async (search) => {
  let posts = await postsPromise

  posts = posts.sort((a, b) => b.date - a.date)

  const index = posts.findIndex((post) => link(postRoutePattern, post) === link(postRoutePattern, search))

  if (index < 0) {
    return unfound
  }

  const post = posts[index]

  const result = await fetch(`${link('/content/posts/:slug', post)}.md`)

  const lns = result.split(/\n```\n/g)

  const content = []
  let i = 0

  while (i < lns.length) {
    if (i % 2) {
      content.push(pre`<pre class="border-radius"><code>${lns[i]}</code></pre>`)
    } else {
      content.push(raw(lns[i]))
    }

    i++
  }

  post.content = content

  return {
    location: link(postRoutePattern, post),
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
      on(postRoutePattern, async (params) => {
        const post = await getPost(params)

        return post
      })

      on('/', async () => {
        const {posts} = await listPosts()

        if (!posts.length) {
          return unfound
        }

        const post = await getPost(posts[0])

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

const component = ({state, commit, next}) => {
  const anchorAttrs = (path, vars) => {
    let href = path

    if (vars != null) {
      href = link(path, vars)
    }

    return {
      href,
      onclick: (e) => {
        e.preventDefault()

        window.history.pushState({}, null, href)

        dispatchLocation(commit, href)
      }
    }
  }

  next(() => {
    window.scroll(0, 0)
  })

  return site`<body class="flex">
    <header>
      <nav class="primary font-size-2">
        <ul class="links flex center bold">
          <li><a ${anchorAttrs('/')}>Erick Merchant</a></li>
          <li><a href="https://github.com/erickmerchant">Projects</a></li>
        </ul>
      </nav>
    </header>
    ${route(state.location, (on) => {
      on(postRoutePattern, () => article`<article class="main">
        <header>
          <h1 class="heading">${state.post.title}</h1>
          <time class="bold" datetime=${new Date(state.post.date).toISOString()}>
            ${new Date(state.post.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
          </time>
        </header>
        <div class="content">${state.post.content}</div>
        <nav>
          <ul class="links flex buttons bold font-size-2">
            ${Boolean(state.prev)
              ? liAnchor`<li class="primary border-radius"><a ${anchorAttrs(postRoutePattern, state.prev)}>${'Older'}</a></li>`
              : liSpan`<li class="neutral border-radius scale-down">${''}</li>`}
            ${Boolean(state.next)
              ? liAnchor`<li class="primary border-radius"><a ${anchorAttrs(postRoutePattern, state.next)}>${'Newer'}</a></li>`
              : liSpan`<li class="neutral border-radius scale-down">${''}</li>`}
          </ul>
        </nav>
      </article>`)

      on(() => error`<section class="main">
        <h1 class="heading">${state.title}</h1>
        <p>${state.error != null ? state.error.message : ''}</p>
      </section>`)
    })}
    <footer class="neutral">
      <ul class="links flex content center bold font-size-4">
        <li><a href="https://github.com/erickmerchant/my-blog">View Source</a></li>
        <li><span>© ${new Date().getFullYear()} Erick Merchant</span></li>
      </ul>
    </footer>
  </body>`
}

const target = document.querySelector('body')

const update = domUpdate(target)

const state = {location: '', title: ''}

const commit = framework({state, component, update})

window.onpopstate = () => {
  dispatchLocation(commit, document.location.pathname)
}

dispatchLocation(commit, document.location.pathname)
