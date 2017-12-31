const icons = require('geomicons-open')
const host = 'http://erickmerchant.com'

module.exports = function ({html, safe, route, link, content}) {
  return html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${route(function (on) {
        on('/404.html', '404 Not Found')

        on('/posts/', 'Posts')

        content.forEach(function (post, index) {
          const title = `${post.title} | Posts`

          if (index === 0) {
            on('/', title)
          }

          on(link('/posts/:slug/', post), title)
        })
      })}</title>
      <link href="/favicon.png" rel="shortcut icon" type="image/png">
      <link href="/bundle.css" rel="stylesheet" type="text/css">
      <link rel="canonical" href="${host}${route()}">
    </head>
    <body class="flex column">
      <nav class="background-black align-center bold mobile-padding-2">
        <div class="padding-2">
          <span class="margin-1">
            <a class="white" href="/">Erick Merchant</a>
          </span>
          <span class="margin-1">
            <a class="white" href="/posts/">
              ${icon('calendar')} Posts
            </a>
          </span>
          <span class="margin-1">
            <a class="white" href="http://github.com/erickmerchant/">
              ${icon('github')} GitHub
            </a>
          </span>
        </div>
      </nav>
      <main class="auto padding-2 max-width full-width margin-horizontal-auto" role="main">
        ${route(function (on) {
          on('/404.html', html`
            <h1>404 Not Found</h1>
            <p>That page doesn't exist. It was either moved, removed, or never existed.</p>
          `)

          on('/posts/', html`
            <h1>Posts</h1>
            <dl>
              ${content.map((post) => html`
                <dt><a href="${link('/posts/:slug/', post)}">${post.title}</a></dt>
                <dd>${post.summary}</dd>
              `)}
            </dl>
          `)

          content.forEach(function (post, index) {
            const body = html`
              <article>
                <header>
                  <h1>${post.title}</h1>
                  <p>
                    <time class="bold" datetime="${post.date.toISOString()}">
                      ${icon('calendar')}
                      ${post.date.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
                    </time>
                  </p>
                </header>
                <div>${safe(post.content)}</div>
              </article>
              <nav class="flex row justify-around padding-2 bold">
                ${
                content[index + 1]
                ? html`
                  <a class="align-left nowrap border-radius padding-2 background-blue white" rel="prev" href="${link('/posts/:slug/', content[index + 1])}">
                    ${icon('chevronLeft')}
                    Older
                  </a>`
                : html`
                  <span class="align-left nowrap border-radius padding-2 background-gray white is-disabled">
                    ${icon('chevronLeft')}
                    Older
                  </span>`
                }
                ${
                content[index - 1]
                ? html`
                  <a class="align-right nowrap border-radius padding-2 background-blue white" rel="next" href="${link('/posts/:slug/', content[index - 1])}">
                    Newer
                    ${icon('chevronRight')}
                  </a>`
                : html`
                  <span class="align-right nowrap border-radius padding-2 background-gray white is-disabled">
                    Newer
                    ${icon('chevronRight')}
                  </span>`
                }
              </nav>
            `

            if (index === 0) {
              on('/', body)
            }

            on(link('/posts/:slug/', post), body)
          })
        })}
      </main>
      <footer class="background-light-gray font-size-small padding-2 align-center bold" role="contentinfo">
        <a class="margin-1 inline-block" href="https://github.com/erickmerchant/erickmerchant.com-source">
          ${icon('github')}
          View Source
        </a>
        <span class="margin-1 inline-block">&copy; Erick Merchant, ${(new Date()).getFullYear()}</span>
      </footer>
    </body>
  </html>`

  function icon (name) {
    return html`
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path d="${icons.paths[name]}" />
      </svg>
    `
  }
}
