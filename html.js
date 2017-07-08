const slug = require('slug')
const ift = require('@erickmerchant/ift')('')
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
    save('404', layout('404 Not Found', host + '/404.html', ({title, url}) => html`
      <form role="search" action="http://google.com/search">
        <h1>${title}</h1>
        <p>That page doesn't exist. It was either moved, removed, or never existed.</p>
      </form>`
    ))

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

      save('posts/', layout('Posts', host + '/posts/', ({title, url}) => html`
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

          save(url, layout(`${post.title} | Posts`, link(host + '/posts/:slug/', post), ({title, url}) => html`
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
            <nav class="flex row justify-around padding-2">
              ${safe(ift(
              posts[index + 1],
              (previous) => html`
                <a class="align-left nowrap border-radius padding-2 bold background-blue white" rel="prev" href="${link('/posts/:slug/', previous)}">
                  ${icon('chevronLeft')}
                  Older
                </a>`,
              () => html`
                <span class="align-left nowrap border-radius padding-2 bold background-gray white is-disabled">
                  ${icon('chevronLeft')}
                  Older
                </span>`
              ))}
              ${safe(ift(
              posts[index - 1],
              (next) => html`
                <a class="align-right nowrap border-radius padding-2 bold background-blue white" rel="next" href="${link('/posts/:slug/', next)}">
                  Newer
                  ${icon('chevronRight')}
                </a>`,
              () => html`
                <span class="align-right nowrap border-radius padding-2 bold background-gray white is-disabled">
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
          <link href="/bundle.css" rel="stylesheet" type="text/css">
          <link rel="canonical" href="${url}">
        </head>
        <body class="flex column border-box">
          <div class="flex column auto desktop-row">
            <div class="align-center desktop-width-1">
              <nav class="auto column items-center justify-start overflow-scroll background-black align-center padding-2 desktop-fixed desktop-top-0 desktop-bottom-0 desktop-width-1 desktop-flex desktop-padding-top-4">
                <span class="desktop-font-size-xx-large padding-1"><a class="white bold" href="/">Erick Merchant</a></span>
                <span class="padding-1 inline-block">
                  <a class="white bold" href="/posts/">
                    ${icon('calendar')}
                    Posts
                  </a>
                </span>
                <span class="padding-1 inline-block">
                  <a class="white bold" href="http://github.com/erickmerchant/">
                    ${icon('github')}
                    GitHub
                  </a>
                </span>
                <span class="padding-1 inline-block">
                  <a class="white bold" href="http://twitter.com/erickmerchant/">
                    ${icon('twitter')}
                    Twitter
                  </a>
                </span>
              </nav>
            </div>
            <div class="flex column auto desktop-width-2">
              <main class="auto padding-1 desktop-padding-vertical-2 desktop-padding-horizontal-4" role="main">
                <div class="max-width">
                  ${safe(main({title, url}))}
                </div>
              </main>
              <footer class="background-light-gray align-center padding-2 font-size-small" role="contentinfo">
                <div class="flex row wrap items-center justify-around max-width margin-horizontal-auto">
                  <span class="padding-1 inline-block">
                    <a class="bold" href="https://github.com/erickmerchant/erickmerchant.com-source">
                      ${icon('github')}
                      View Source
                    </a>
                  </span>
                  <span class="padding-1 inline-block">
                    <a class="bold" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&amp;text=${encodeURIComponent(title)}" target="_blank">
                      ${icon('twitter')}
                      Tweet
                    </a>
                  </span>
                  <span class="bold padding-1 inline-block">&copy; Erick Merchant, ${(new Date()).getFullYear()}</span>
                </div>
              </footer>
            </div>
          </div>
        </body>`
    }

    function icon (name) {
      return safe(html`
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path d="${icons.paths[name]}" />
      </svg>`)
    }
  }
}
