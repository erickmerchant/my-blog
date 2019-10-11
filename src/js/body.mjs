import {view, safe} from '@erickmerchant/framework'
import {route, link} from './router.mjs'
import {dispatchLocation} from './store.mjs'

const {site, article, liAnchor, error} = view()

export default ({state, commit, next}) => {
  const anchorAttrs = (href) => {
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
      <nav class="nav primary-nav-theme">
        <ul class="flex-list justify-center bold">
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
          <div>${safe(state.post.html)}</div>
          <nav class="pagination">
            <ul class="flex-list justify-around bold">
              ${Boolean(state.prev)
                ? liAnchor`<li class="primary-nav-theme"><a ${{
                  class: 'prev',
                  ...anchorAttrs(link('/posts/:slug/', state.prev))
                }}><span>${'Older'}</span></a></li>`
                : null}
              ${Boolean(state.next)
                ? liAnchor`<li class="primary-nav-theme"><a ${{
                  class: 'next',
                  ...anchorAttrs(link('/posts/:slug/', state.next))
                }}><span>${'Newer'}</span></a></li>`
                : null}
            </ul>
          </nav>
        </article>`)

        on(() => error`<section>
          <h1>${state.title}</h1>
          <p>${state.error != null ? state.error.message : ''}</p>
        </section>`)
      })}
    </main>
    <footer class="footer">
      <ul class="flex-list justify-center bold">
        <li><a href="https://github.com/erickmerchant/my-blog">View Source</a></li>
        <li><span>${`© ${new Date().getFullYear()} Erick Merchant`}</span></li>
      </ul>
    </footer>
  </body>`
}
