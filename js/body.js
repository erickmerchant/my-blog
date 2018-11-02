const { body, nav, div, a, main, h1, p, footer, span, article, header, time, svg, path } = require('@erickmerchant/framework/html')
const icons = require('geomicons-open')
const { route, link } = require('@erickmerchant/router')()
const history = require('./history.js')

module.exports = ({ state }) => {
  return body(({ onupdate }) => {
    onupdate(() => {
      // window.scroll(0, 0)
    })

    return [{ class: 'flex desktop-grid layout column border-box' },
      nav({ class: 'background-black align-center bold' },
        div({ class: 'padding-2 desktop-sticky desktop-top-0 desktop-flex desktop-column desktop-justify-center desktop-height-view items-center' },
          a({
            class: 'margin-1 desktop-font-size-3 white',
            href: '/',
            onclick (e) {
              e.preventDefault()

              history.push('/', {})
            }
          },
          'Erick Merchant'
          ),
          a({
            class: 'margin-1 white',
            href: 'https://github.com/erickmerchant/'
          },
          icon('github'),
          'GitHub'
          )
        )
      ),
      main({
        class: 'flex-auto padding-2 desktop-margin-x-4 max-width-measured width-full margin-x-auto',
        role: 'main'
      },
      ...route(state.location, (on) => {
        on(['/posts/:slug/', '/'], (params) => [
          article(
            header(
              h1(state.post.title),
              time({ class: 'bold', datetime: (new Date(state.post.date)).toISOString() },
                icon('calendar'), (new Date(state.post.date)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              )
            ),
            state.post.html
          ),
          nav({ class: 'flex row justify-around padding-2 bold' },
            state.previous
              ? a({
                class: 'align-left nowrap border-radius padding-2 background-blue hover-background-hover-blue white',
                rel: 'prev',
                href: link('/posts/:slug/', state.previous),
                onclick (e) {
                  e.preventDefault()

                  history.push(link('/posts/:slug/', state.previous))
                }
              },
              icon('chevronLeft'),
              'Older'
              )
              : span({ class: 'align-left nowrap border-radius padding-2 background-gray white' },
                icon('chevronLeft'),
                'Older'
              ),
            state.next
              ? a({
                class: 'align-right nowrap border-radius padding-2 background-blue hover-background-hover-blue white',
                rel: 'next',
                href: link('/posts/:slug/', state.next),
                onclick (e) {
                  e.preventDefault()

                  history.push(link('/posts/:slug/', state.next))
                }
              },
              'Newer',
              icon('chevronRight')
              )
              : span({ class: 'align-right nowrap border-radius padding-2 background-gray white' },
                'Newer',
                icon('chevronRight')
              )
          )
        ])

        on(() => [
          h1(state.title),
          p(state.error != null ? state.error.message : '')
        ])
      })
      ),
      footer({ class: 'background-light-gray font-size-6 padding-2 align-center bold', role: 'contentinfo' },
        a({ class: 'margin-1 inline-block', href: 'https://github.com/erickmerchant/my-blog' },
          icon('github'),
          'View Source'
        ),
        span({ class: 'margin-1 inline-block' }, `&copy; ${(new Date()).getFullYear()} Erick Merchant`)
      )
    ]
  })

  function icon (name) {
    return svg({ class: 'icon', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 32 32' },
      path({ d: icons.paths[name] })
    )
  }
}
