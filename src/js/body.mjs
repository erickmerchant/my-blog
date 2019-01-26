/* global window, document */

import {html} from '@erickmerchant/framework'
import router from '@erickmerchant/router'
import {dispatchLocation} from './store.mjs'

const {route, link} = router()
const {body, nav, div, a, main, h1, p, footer, span, article, header, time} = html

export default (state, commit) => {
  const getOnClick = (href) => (e) => {
    e.preventDefault()

    window.history.pushState({}, null, href)

    dispatchLocation(commit, href)
  }

  return body(
    {
      onupdate() {
        if (typeof window !== 'undefined') {
          setTimeout(() => window.scroll({top: 0, left: 0, behavior: 'smooth'}), 10)
        }
      },
      onmount() {
        window.onpopstate = () => {
          dispatchLocation(commit, document.location.pathname)
        }

        dispatchLocation(commit, document.location.pathname)
      }
    },
    nav(
      {class: 'nav'},
      div(
        {},
        a({
          href: '/',
          onclick: getOnClick('/')
        }, 'Erick Merchant'),
        a({
          href: 'https://github.com/erickmerchant'
        }, 'Projects')
      )
    ),
    main({}, ...route(state.location, (on) => {
      on(['/posts/:slug/', '/'], () => [
        article(
          {
            class: 'article',
            onupdate() {
              this.insertAdjacentHTML('beforeend', state.post.html)
            }
          },
          header(
            {},
            h1({}, state.post.title),
            time(
              {
                datetime: (new Date(state.post.date)).toISOString()
              },
              (new Date(state.post.date)).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
            )
          )
        ),
        nav(
          {class: 'pagination'},
          Boolean(state.prev)
            ? a({
              class: 'prev',
              rel: 'prev',
              href: link('/posts/:slug/', state.prev),
              onclick: getOnClick(link('/posts/:slug/', state.prev))
            }, 'Older')
            : span({class: 'prev'}, 'Older'),
          Boolean(state.next)
            ? a({
              class: 'next',
              rel: 'next',
              href: link('/posts/:slug/', state.next),
              onclick: getOnClick(link('/posts/:slug/', state.next))
            }, 'Newer')
            : span({class: 'next'}, 'Newer')
        )
      ])

      on(() => [
        h1(state.title),
        p({}, state.error != null ? state.error.message : '')
      ])
    })),
    footer(
      {
        class: 'footer'
      },
      a({
        href: 'https://github.com/erickmerchant/my-blog'
      }, 'View Source'),
      span({}, `© ${(new Date()).getFullYear()} Erick Merchant`)
    )
  )
}
