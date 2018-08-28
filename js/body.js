const html = require('nanohtml')
const raw = require('nanohtml/raw')
const icons = require('geomicons-open')
const {route, link} = require('@erickmerchant/router')()
const history = require('./history.js')
const preventDefault = require('prevent-default')

module.exports = function ({state, next}) {
  next(function () {
    window.scroll(0, 0)
  })

  return html`<body class="flex desktop-grid layout column border-box">
    <nav class="background-black align-center bold">
      <div class="padding-2 desktop-sticky desktop-top-0 desktop-flex desktop-column desktop-justify-center desktop-height-100vh">
        <span class="margin-1 desktop-font-size-3">
          <a class="white" href="/" onclick=${preventDefault(function (e) { history.push('/', {}) })}>Erick Merchant</a>
        </span>
        <span class="margin-1">
          <a class="white" href="https://github.com/erickmerchant/">
            ${icon('github')} GitHub
          </a>
        </span>
      </div>
    </nav>
    <main class="flex-auto padding-2 desktop-margin-x-4 max-width-40em width-full margin-x-auto" role="main">
      ${main()}
    </main>
    <footer class="background-light-gray font-size-6 padding-2 align-center bold" role="contentinfo">
      <a class="margin-1 inline-block" href="https://github.com/erickmerchant/my-blog">
        ${icon('github')}
        View Source
      </a>
      <span class="margin-1 inline-block">${raw('&copy;')} ${(new Date()).getFullYear()} Erick Merchant</span>
    </footer>
  </body>`

  function main () {
    return route(state.location, function (on) {
      on('/posts/:slug/', post)

      on('/', post)

      on(() => html`<div>
        <h1>${state.title}</h1>
        <p>${state.error != null ? state.error.message : ''}</p>
      </div>`)
    })
  }

  function previousButton () {
    return state.previous
      ? html`<a class="align-left nowrap border-radius padding-2 background-blue hover-background-hover-blue white" rel="prev" href="${link('/posts/:slug/', state.previous)}" onclick=${preventDefault(function (e) { history.push(link('/posts/:slug/', state.previous), {}) })}>
          ${icon('chevronLeft')}
          Older
        </a>`
      : html`<span class="align-left nowrap border-radius padding-2 background-gray white">
          ${icon('chevronLeft')}
          Older
        </span>`
  }

  function nextButton () {
    return state.next
      ? html`<a class="align-right nowrap border-radius padding-2 background-blue hover-background-hover-blue white" rel="next" href="${link('/posts/:slug/', state.next)}" onclick=${preventDefault(function (e) { history.push(link('/posts/:slug/', state.next), {}) })}>
          Newer
          ${icon('chevronRight')}
        </a>`
      : html`<span class="align-right nowrap border-radius padding-2 background-gray white">
          Newer
          ${icon('chevronRight')}
        </span>`
  }

  function post () {
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
        <div>${raw(state.post.html)}</div>
      </article>
      <nav class="flex row justify-around padding-2 bold">
        ${previousButton({state})}
        ${nextButton({state})}
      </nav>
    </div>`
  }

  function icon (name) {
    return html`<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path d="${icons.paths[name]}" />
      </svg>`
  }
}
