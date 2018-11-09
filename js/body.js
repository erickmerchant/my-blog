const { body, nav, div, a, main, h1, p, footer, span, article, header, time, svg, path } = require('@erickmerchant/framework/html')
const icons = require('geomicons-open')
const { route, link } = require('@erickmerchant/router')()
const history = require('./history.js')

module.exports = ({ state }) => {
  return body(({ onupdate }) => {
    onupdate(() => {
      if (typeof window !== 'undefined') {
        setTimeout(() => window.scroll({ top: 0, left: 0, behavior: 'smooth' }), 10)
      }
    })

    return [
      nav(
        { class: 'nav' },
        div(
          a({
            href: '/',
            onclick (e) {
              e.preventDefault()

              history.push('/', {})
            }
          }, 'Erick Merchant'),
          a({
            href: 'https://github.com/erickmerchant/'
          }, icon('github'), ' GitHub')
        )
      ),
      main(
        ...route(state.location, (on) => {
          on(['/posts/:slug/', '/'], () => [
            article(({ onupdate }) => {
              onupdate((el) => {
                el.insertAdjacentHTML('beforeend', state.post.html)
              })

              return [
                { class: 'article' },
                header(
                  h1(state.post.title),
                  time(
                    {
                      datetime: (new Date(state.post.date)).toISOString()
                    },
                    icon('calendar'),
                    ' ',
                    (new Date(state.post.date)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  )
                )
              ]
            }),
            nav(
              { class: 'pagination' },
              a(!!state.previous, () => [{
                class: 'previous',
                rel: 'prev',
                href: link('/posts/:slug/', state.previous),
                onclick (e) {
                  e.preventDefault()

                  history.push(link('/posts/:slug/', state.previous))
                }
              }, icon('chevronLeft'), ' Older']),
              span(!state.previous, () => [{ class: 'previous' }, icon('chevronLeft'), ' Older']),
              a(!!state.next, () => [{
                class: 'next',
                rel: 'next',
                href: link('/posts/:slug/', state.next),
                onclick (e) {
                  e.preventDefault()

                  history.push(link('/posts/:slug/', state.next))
                }
              }, 'Newer ', icon('chevronRight')]),
              span(!state.next, () => [{ class: 'next' }, 'Newer ', icon('chevronRight')])
            )
          ])

          on(() => [
            h1(state.title),
            p(state.error != null ? state.error.message : '')
          ])
        })
      ),
      footer(
        {
          class: 'footer'
        },
        a({
          href: 'https://github.com/erickmerchant/my-blog'
        }, icon('github'), ' View Source'),
        span(`© ${(new Date()).getFullYear()} Erick Merchant`)
      )
    ]
  })
}

function icon (name) {
  return svg({
    class: 'icon',
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 32 32'
  }, path({ d: icons.paths[name] }))
}
