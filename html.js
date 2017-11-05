const slug = require('slug')
const moment = require('moment-timezone')
const groupby = require('lodash.groupby')
const icons = require('geomicons-open')
const host = 'http://erickmerchant.com'

module.exports = ({collection}) => {
  collection('post', ({on, save, remove, read}) => {
    on('draft', ({parameter, option}) => {
      option('title', {
        description: 'the title',
        required: true
      })

      option('summary', {
        description: 'the summary',
        default: ''
      })

      return (args) => {
        save('posts/:slug', {
          title: args.title,
          summary: args.summary,
          slug: slug(args.title.toLowerCase()),
          timeZone: moment.tz.guess()
        })
      }
    })

    on('publish', ({parameter, option}) => {
      parameter('post', {
        description: 'the post to publish',
        required: true
      })

      return (args) => {
        read(args.post, 'posts/:slug', (post) => {
          save(
            'posts/:time.:slug',
            Object.assign(post, {
              time: Date.now()
            }),
            () => {
              remove(args.post)
            }
          )
        })
      }
    })
  })

  return ({get, html, save, safe, link, dev}) => {
    save('404', layout({
      title: '404 Not Found',
      url: '/404.html',
      main: ({title, url}) => html`
      <div>
        <h1>${title}</h1>
        <p>That page doesn't exist. It was either moved, removed, or never existed.</p>
      </div>`
    }))

    const routes = ['posts/:time.:slug']

    if (dev) {
      routes.push('posts/:slug')
    }

    get(routes, (posts) => {
      posts = posts.reverse().map((post) => {
        if (post.time) {
          post.date = moment(new Date(Number(post.time))).tz(post.timeZone)
        } else {
          post.date = moment()
        }

        return post
      })

      const grouped = groupby(posts, (post) => post.date.format('MMMM YYYY'))

      save('posts/', layout({
        title: 'Posts',
        url: '/posts/',
        main: ({title, url}) => html`
        <h1>${title}</h1>
        ${safe(Object.keys(grouped).map((monthYear) => html`
          <section>
            <h2>
              ${icon('calendar')}
              ${monthYear}
            </h2>
            <dl>
              ${safe(grouped[monthYear].map((post) => html`
                <dt><a href="${link('/posts/:slug/', post)}">${post.title}</a></dt>
                <dd>${post.summary}</dd>`
              ))}
            </dl>
          </section>`
        ))}`
      }))

      if (posts.length > 0) {
        posts.forEach((post, index) => {
          let url = link('/posts/:slug/', post)

          if (index === 0) {
            url = ['/', url]
          }

          save(url, layout({
            title: `${post.title} | Posts`,
            url: link('/posts/:slug/', post),
            main: ({title, url}) => html`
            <article>
              <header>
                <h1>${post.title}</h1>
                <p>
                  <time class="bold" datetime="${post.date.format('YYYY-MM-DD')}">
                    ${icon('calendar')}
                    ${post.date.format('MMMM D, YYYY')}
                  </time>
                </p>
              </header>
              <div>${safe(post.content)}</div>
            </article>
            <nav class="flex row justify-around padding-2 bold">
              ${safe(
              posts[index + 1]
              ? html`
                <a class="align-left nowrap border-radius padding-2 background-blue white" rel="prev" href="${link('/posts/:slug/', posts[index + 1])}">
                  ${icon('chevronLeft')}
                  Older
                </a>`
              : html`
                <span class="align-left nowrap border-radius padding-2 background-gray white is-disabled">
                  ${icon('chevronLeft')}
                  Older
                </span>`
              )}
              ${safe(
              posts[index - 1]
              ? html`
                <a class="align-right nowrap border-radius padding-2 background-blue white" rel="next" href="${link('/posts/:slug/', posts[index - 1])}">
                  Newer
                  ${icon('chevronRight')}
                </a>`
              : html`
                <span class="align-right nowrap border-radius padding-2 background-gray white is-disabled">
                  Newer
                  ${icon('chevronRight')}
                </span>`
              )}
            </nav>`
          }))
        })
      }
    })

    function layout ({title, url, main}) {
      return html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${title}</title>
          <link href="/favicon.png" rel="shortcut icon" type="image/png">
          <link href="/bundle.css" rel="stylesheet" type="text/css">
          <link rel="canonical" href="${host}${url}">
        </head>
        <body class="grid">
          <nav class="background-black mobile-full-width align-center bold mobile-padding-2">
            <div class="desktop-flex desktop-column desktop-fixed desktop-top-0 desktop-bottom-0 desktop-width-1 desktop-justify-center">
              <span>
                <a class="desktop-font-size-xx-large white margin-1 inline-block" href="/">Erick Merchant</a>
              </span>
              <span>
                <a class="white margin-1 inline-block" href="/posts/">
                  ${icon('calendar')}
                  Posts
                </a>
              </span>
              <span>
                <a class="white margin-1 inline-block" href="http://github.com/erickmerchant/">
                  ${icon('github')}
                  GitHub
                </a>
              </span>
              <span>
                <a class="white margin-1 inline-block" href="http://twitter.com/erickmerchant/">
                  ${icon('twitter')}
                  Twitter
                </a>
              </span>
            </div>
          </nav>
          <main class="padding-2 desktop-margin-horizontal-4 max-width mobile-margin-horizontal-auto" role="main">
            ${safe(main({title, url}))}
          </main>
          <footer class="background-light-gray mobile-full-width font-size-small padding-2 align-center bold" role="contentinfo">
            <a class="margin-1 inline-block" href="https://github.com/erickmerchant/erickmerchant.com-source">
              ${icon('github')}
              View Source
            </a>
            <a class="margin-1 inline-block" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(host + url)}&amp;text=${encodeURIComponent(title)}" target="_blank">
              ${icon('twitter')}
              Tweet
            </a>
            <span class="margin-1 inline-block">&copy; Erick Merchant, ${(new Date()).getFullYear()}</span>
          </footer>
        </body>
      </html>`
    }

    function icon (name) {
      return safe(html`
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path d="${icons.paths[name]}" />
      </svg>`)
    }
  }
}
