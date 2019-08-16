import {view, safe} from '@erickmerchant/framework'
import {route, link} from './router.mjs'
import {dispatchLocation} from './store.mjs'

const {site, main, liAnchor, error} = view

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
    <nav class="nav">
      <ul>
        <li><a ${anchorAttrs('/')}>Erick Merchant</a></li>
        <li><a href="https://github.com/erickmerchant">Projects</a></li>
      </ul>
    </nav>
    ${route(state.location, (on) => {
      on('/posts/:slug/', () => main`<main>
        <article class="article">
          <header>
            <h1>${state.post.title}</h1>
            <time datetime=${(new Date(state.post.date)).toISOString()}>
              ${(new Date(state.post.date)).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
            </time>
          </header>
          ${safe(state.post.html)}
        </article>
        <nav class="pagination">
          <ul>
            ${Boolean(state.prev)
              ? liAnchor`<li><a ${{
                class: 'prev',
                rel: 'prev',
                ...anchorAttrs(link('/posts/:slug/', state.prev))
              }}>${'Older'}</a></li>`
              : null}
            ${Boolean(state.next)
              ? liAnchor`<li><a ${{
                class: 'next',
                rel: 'next',
                ...anchorAttrs(link('/posts/:slug/', state.next))
              }}>${'Newer'}</a></li>`
              : null}
          </ul>
        </nav>
      </main>`)

      on(() => error`<main>
        <h1>${state.title}</h1>
        <p>${state.error != null ? state.error.message : ''}</p>
      </main>`)
    })}
    <footer class="footer">
      <ul>
        <li><a href="https://github.com/erickmerchant/my-blog">View Source</a></li>
        <li><span>${`© ${(new Date()).getFullYear()} Erick Merchant`}</span></li>
      </ul>
    </footer>
  </body>`
}
