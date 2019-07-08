import {view, safe} from '@erickmerchant/framework'
import {route, link} from './router.mjs'
import {dispatchLocation} from './store.mjs'

const {site, article, pagination, enabledAnchor, disabledAnchor, heading1, paragraph} = view

export default (state, commit) => {
  const getOnClick = (href) => (e) => {
    e.preventDefault()

    window.history.pushState({}, null, href)

    dispatchLocation(commit, href)
  }

  return site`<body
    onappend=${() => {
      window.onpopstate = () => {
        dispatchLocation(commit, document.location.pathname)
      }

      dispatchLocation(commit, document.location.pathname)
    }}
  >
    <nav class="nav">
      <div>
        <a
          href="/"
          onclick=${getOnClick('/')}
        >Erick Merchant</a>
        <a href="https://github.com/erickmerchant">Projects</a>
      </div>
    </nav>
    <main>${route(state.location, (on) => {
      on(['/posts/:slug/', '/'], () => [
        article`<article class="article">
          <header>
            <h1>${state.post.title}</h1>
            <time datetime=${(new Date(state.post.date)).toISOString()}>
              ${(new Date(state.post.date)).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
            </time>
          </header>
          ${safe(state.post.html)}
        </article>`,
        pagination`<nav class="pagination">
          ${Boolean(state.prev)
            ? enabledAnchor`<a ${{
              class: 'prev',
              rel: 'prev',
              href: link('/posts/:slug/', state.prev),
              onclick: getOnClick(link('/posts/:slug/', state.prev))
            }}>${'Older'}<a>`
            : disabledAnchor`<span class=${'prev'}>${'Older'}</span>`}
          ${Boolean(state.next)
            ? enabledAnchor`<a ${{
              class: 'next',
              rel: 'next',
              href: link('/posts/:slug/', state.next),
              onclick: getOnClick(link('/posts/:slug/', state.next))
            }}>${'Newer'}<a>`
            : disabledAnchor`<span class=${'next'}>${'Newer'}</span>`}
        </nav>`
      ])

      on(() => [
        heading1`<h1>${state.title}</h1>`,
        paragraph`<p>${state.error != null ? state.error.message : ''}</p>`
      ])
    })}</main>
    <footer class="footer">
      <a href="https://github.com/erickmerchant/my-blog">View Source</a>
      <span>${`© ${(new Date()).getFullYear()} Erick Merchant`}</span>
    </footer>
  </body>`
}
