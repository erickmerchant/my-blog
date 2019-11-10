import {view} from '@erickmerchant/framework'
import {route, link} from './router.mjs'
import {dispatchLocation} from './store.mjs'

const {site, article, liAnchor, liSpan, error} = view()

export default ({state, commit, next}) => {
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

  return site`<body>
    <header>
      <nav class="box-shadow-inset primary font-size-2">
        <ul class="links center bold">
          <li><a ${anchorAttrs('/')}>Erick Merchant</a></li>
          <li><a href="https://github.com/erickmerchant">Projects</a></li>
        </ul>
      </nav>
    </header>
    <main>
      ${route(state.location, (on) => {
        on('/posts/:slug/', () => article`<article>
          <header>
            <h1>${state.post.title}</h1>
            <time class="bold" datetime=${new Date(state.post.date).toISOString()}>
              ${new Date(state.post.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
            </time>
          </header>
          <div class="content">${state.post.content}</div>
          <nav>
            <ul class="links buttons space-around bold font-size-2">
              ${Boolean(state.prev)
                ? liAnchor`<li class="primary"><a ${anchorAttrs('/posts/:slug/', state.prev)}><span>${'Older'}</span></a></li>`
                : liSpan`<li class="neutral"><span>${'Older'}</span></li>`}
              ${Boolean(state.next)
                ? liAnchor`<li class="primary"><a ${anchorAttrs('/posts/:slug/', state.next)}><span>${'Newer'}</span></a></li>`
                : liSpan`<li class="neutral"><span>${'Newer'}</span></li>`}
            </ul>
          </nav>
        </article>`)

        on(() => error`<section>
          <h1>${state.title}</h1>
          <p>${state.error != null ? state.error.message : ''}</p>
        </section>`)
      })}
    </main>
    <footer>
      <ul class="links center bold font-size-4">
        <li><a href="https://github.com/erickmerchant/my-blog">View Source</a></li>
        <li><span>© ${new Date().getFullYear()} Erick Merchant</span></li>
      </ul>
    </footer>
  </body>`
}
