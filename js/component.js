const html = require('nanohtml')
const raw = require('nanohtml/raw')
const icons = require('geomicons-open')
const {route, link} = require('@erickmerchant/router')()
const history = require('./history.js')
const preventDefault = require('prevent-default')
const host = 'http://erickmerchant.com'

module.exports = function ({state, next}) {
  next(function () {
    window.scroll(0, 0)
  })

  return html`
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${state.title}</title>
      <link href="/favicon.png" rel="shortcut icon" type="image/png">
      <link href="/bundle.css" rel="stylesheet" type="text/css">
      <link rel="canonical" href="${host}${state.location}">
    </head>
    <body class="flex desktop-grid column">
      <nav class="background-black align-center bold">
        <div class="padding-2">
          <span class="margin-1">
            <a class="white" href="/" onclick=${preventDefault(function (e) { history.push('/', {}) })}>Erick Merchant</a>
          </span>
          <span class="margin-1">
            <a class="white" href="http://github.com/erickmerchant/">
              ${icon('github')} GitHub
            </a>
          </span>
        </div>
      </nav>
      <main class="auto padding-2 desktop-margin-horizontal-4 max-width full-width margin-horizontal-auto" role="main">
        ${main()}
      </main>
      <footer class="background-light-gray font-size-small padding-2 align-center bold" role="contentinfo">
        <a class="margin-1 inline-block" href="https://github.com/erickmerchant/erickmerchant.com-source">
          ${icon('github')}
          View Source
        </a>
        <span class="margin-1 inline-block">${raw('&copy;')} Erick Merchant, ${(new Date()).getFullYear()}</span>
      </footer>
    </body>
  </html>`

  function main () {
    return route(state.location, function (on) {
      on('/posts/:slug/', postPage)

      on('/', postPage)

      on(() => html`<div>
        <h1>404 Not Found</h1>
        <p>That page doesn't exist. It was either moved, removed, or never existed.</p>
      </div>`)
    })
  }

  function postsItem (post) {
    return html`<li>${icon('calendar')} <a href="${link('/posts/:slug/', post)}" onclick=${preventDefault(function (e) {
      history.push(link('/posts/:slug/', post), {})
    })}>${post.title}</a></li>`
  }

  function previousButton ({state}) {
    return state.previous
      ? html`
        <a class="align-left nowrap border-radius padding-2 background-blue white" rel="prev" href="${link('/posts/:slug/', state.previous)}" onclick=${preventDefault(function (e) { history.push(link('/posts/:slug/', state.previous), {}) })}>
          ${icon('chevronLeft')}
          Older
        </a>`
      : html`
        <span class="align-left nowrap border-radius padding-2 background-gray white is-disabled">
          ${icon('chevronLeft')}
          Older
        </span>`
  }

  function nextButton ({state}) {
    return state.next
      ? html`
        <a class="align-right nowrap border-radius padding-2 background-blue white" rel="next" href="${link('/posts/:slug/', state.next)}" onclick=${preventDefault(function (e) { history.push(link('/posts/:slug/', state.next), {}) })}>
          Newer
          ${icon('chevronRight')}
        </a>`
      : html`
        <span class="align-right nowrap border-radius padding-2 background-gray white is-disabled">
          Newer
          ${icon('chevronRight')}
        </span>`
  }

  function postPage (params) {
    return html`<div>
      <article>
        <header>
          <h1>${state.post.title}</h1>
          <p>
            <time class="bold" datetime="${(new Date(state.post.date)).toISOString()}">
              ${icon('calendar')} ${(new Date(state.post.date)).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
            </time>
          </p>
        </header>
        <div>${raw(state.post.content)}</div>
      </article>
      <nav class="flex row justify-around padding-2 bold">
        ${previousButton({state})}
        ${nextButton({state})}
      </nav>
    </div>`
  }

  function icon (name) {
    return html`
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path d="${icons.paths[name]}" />
      </svg>`
  }
}
