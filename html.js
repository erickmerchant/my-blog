const slug = require('slug')
const ift = require('@erickmerchant/ift')('')
const moment = require('moment-timezone')
const groupby = require('lodash.groupby')
const icons = require('geomicons-open')
const host = 'http://erickmerchant.com/'

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
    save('404', layout('404 Not Found', '404.html', ({title, url}) => html`
      <form role="search" action="http://google.com/search" class="clearfix">
        <h1>${title}</h1>
        <p>That page doesn't exist. It was either moved, removed, or never existed.</p>
        <div class="center">
          <input type="hidden" name="q" value="site:${host}">
          <input class="field col-12 sm-col-6" type="text" placeholder="Search..." name="q">
          <br class="sm-hide">
          <button class="rounded btn bold background-blue white p2 m1 h4" type="submit">
            ${icon('search')}
            Submit
          </button>
        </div>
      </form>`
    ))

    const routes = ['posts/:time.:slug']

    if (dev) {
      routes.push('posts/:slug')
    }

    get(routes, (posts) => {
      posts = posts.reverse().map((post) => {
        post.date = moment(new Date(Number(post.time))).tz(post.timeZone)

        return post
      })

      const grouped = groupby(posts, (post) => post.date.format('MMMM YYYY'))

      save('posts/', layout('Posts', 'posts/', ({title, url}) => html`
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
      ))

      if (posts.length > 0) {
        posts.forEach((post, index) => {
          let url = link('/posts/:slug/', post)

          if (index === 0) {
            url = ['/', url]
          }

          save(url, layout(`${post.title} | Posts`, link('/posts/:slug/', post), ({title, url}) => html`
            <article>
              <header>
                <h1>${post.title}</h1>
                <p>
                  <time class="h3 bold" datetime="${post.date.format('YYYY-MM-DD')}">
                    ${icon('calendar')}
                    ${post.date.format('MMMM D, YYYY')}
                  </time>
                </p>
              </header>
              <div>${safe(post.content)}</div>
            </article>
            <nav class="h4 clearfix p2 flex flex-wrap justify-around">
              ${safe(ift(
              posts[index + 1],
              (previous) => html`
                <a class="nowrap m1 rounded left-align btn bold background-blue white p2" rel="prev" href="${link('/posts/:slug/', previous)}">
                  ${icon('chevronLeft')}
                  Older
                </a>`,
              () => html`
                <span class="nowrap m1 rounded left-align btn bold background-gray white is-disabled p2">
                  ${icon('chevronLeft')}
                  Older
                </span>`
              ))}
              ${safe(ift(
              posts[index - 1],
              (next) => html`
                <a class="nowrap m1 rounded right-align btn bold background-blue white p2" rel="next" href="${link('/posts/:slug/', next)}">
                  Newer
                  ${icon('chevronRight')}
                </a>`,
              () => html`
                <span class="nowrap m1 rounded right-align btn bold background-gray white is-disabled p2">
                  Newer
                  ${icon('chevronRight')}
                </span>`
              ))}
            </nav>
            `
          ))
        })
      }
    })

    function layout (title, url, main) {
      return html`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${title}</title>
          <link href="/favicon.png" rel="shortcut icon" type="image/png">
          <link href="/app.css" rel="stylesheet" type="text/css">
          <link rel="canonical" href="${host}${url}">
        </head>
        <body class="flex flex-column">
          <div class="col flex flex-column sm-flex-row full-view-height">
            <div class="background-black sm-col-4 center">
              <div class="sm-fixed top-0 bottom-0 sm-col-4 p2 flex-auto sm-flex flex-column items-center justify-top overflow-scroll sm-my2">
                <span class="sm-col my1 inline-block sm-my2"><a class="white bold m1 lg-h1 md-h2 sm-h3" href="/">Erick Merchant</a></span>
                <nav class="sm-flex flex-column inline-block">
                  <span class="sm-col my1 inline-block sm-my2">
                    <a class="white bold m1" href="/posts/">
                      ${icon('calendar')}
                      Posts
                    </a>
                  </span>
                  <span class="sm-col my1 inline-block sm-my2">
                    <a class="white bold m1" href="http://github.com/erickmerchant/">
                      ${icon('github')}
                      GitHub
                    </a>
                  </span>
                  <span class="sm-col my1 inline-block sm-my2">
                    <a class="white bold m1" href="http://twitter.com/erickmerchant/">
                      ${icon('twitter')}
                      Twitter
                    </a>
                  </span>
                </nav>
              </div>
            </div>
            <div class="sm-col-8 pt2 flex flex-column flex-auto">
              <main role="main" class="block flex-auto">
                <div class="mx-auto max-width-3 px3">
                  ${safe(main({title, url}))}
                </div>
              </main>
              <footer class="background-light-gray block px3 muted h6" role="contentinfo">
                <div class="p2 max-width-3 mx-auto center sm-flex flex-wrap items-center justify-center">
                  <a class="inline-block bold m1" href="https://github.com/erickmerchant/erickmerchant.com-source">
                    ${icon('github')}
                    View Source
                  </a>
                  <a class="inline-block bold m1" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&amp;text=${encodeURIComponent(title)}" target="_blank">
                    ${icon('twitter')}
                    Tweet
                  </a>
                  <span class="inline-block m1 bold">&copy; Erick Merchant, ${(new Date()).getFullYear()}</span>
                </div>
              </footer>
            </div>
          </div>
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
