const directory = require('./directory.js')
const path = require('path')

module.exports = function pages () {
  const swig = require('swig')
  const moment = require('moment')
  const engine = require('static-engine')
  const read = require('static-engine-read')
  const pager = require('static-engine-pager')
  const first = require('static-engine-first')
  const collection = require('static-engine-collection')
  const render = require('static-engine-render')
  const hljs = require('highlight.js')
  const cson = require('cson-parser')
  const Remarkable = require('remarkable')
  var defaults = require('static-engine-defaults')
  var params = require('static-engine-params')
  var frontmatter = require('static-engine-frontmatter')
  var sort = require('static-engine-sort')
  var postPages, archivePage, _404Page
  var markdown, remarkable

  function renderer (file) {
    return function (page, done) {
      swig.renderFile(path.join('./templates/', file), page, done)
    }
  }

  swig.setDefaults({ cache: false })

  frontmatter = frontmatter(cson.parse)

  remarkable = new Remarkable({
    highlight: function (code) {
      return hljs.highlightAuto(code).value
    },
    langPrefix: 'lang-'
  })

  markdown = function (pages, done) {
    pages.forEach(function (page) {
      page.content = remarkable.render(page.content)

      return page
    })

    done(null, pages)
  }

  params = params('./content/:categories+/:date.:slug.md', {
    date: function (date) {
      return moment(date, 'x')
    }
  })

  sort = sort(function (a, b) {
    return b.date.diff(a.date)
  })

  defaults = defaults('./content/defaults.cson', cson.parse)

  postPages = [
    read('./content/posts/*'),
    params,
    frontmatter,
    markdown,
    sort,
    pager,
    defaults,
    render(path.join(directory, 'posts/:slug/index.html'), renderer('post.html')),
    first,
    render(path.join(directory, 'index.html'), renderer('post.html'))
  ]

  archivePage = [
    read('./content/posts.md'),
    frontmatter,
    markdown,
    collection('posts', [
      read('./content/posts/*'),
      params,
      frontmatter,
      markdown,
      sort
    ]),
    defaults,
    render(path.join(directory, 'posts/index.html'), renderer('posts.html'))
  ]

  _404Page = [
    read('./content/404.md'),
    frontmatter,
    markdown,
    defaults,
    render(path.join(directory, '404.html'), renderer('404.html'))
  ]

  return engine(postPages, archivePage, _404Page)
}
