const { html, head, meta, title, link } = require('@erickmerchant/framework/html')
const body = require('./body.js')
const host = 'https://erickmerchant.com'

module.exports = ({ state, next }) => {
  return html({ lang: 'en' },
    head(
      meta({ charset: 'utf-8' }),
      meta({ 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' }),
      meta({ name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      title(state.title),
      link({ href: '/favicon.png', rel: 'shortcut icon', type: 'image/png' }),
      link({ href: '/css/index.css', rel: 'stylesheet', type: 'text/css' }),
      link({ rel: 'canonical', href: `${host}${state.location}` })
    ),
    body({ state, next })
  )
}
