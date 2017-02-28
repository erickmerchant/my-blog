'use strict'

const path = require('path')
const chokidar = require('chokidar')
const atlatl = require('atlatl')
const moment = require('moment-timezone')
const engine = require('static-engine')
const read = require('static-engine-read')
const pager = require('static-engine-pager')
const first = require('static-engine-first')
const collection = require('static-engine-collection')
const render = require('static-engine-render')
const Highlights = require('highlights')
const escape = require('escape-html')
const cson = require('cson-parser')
const Remarkable = require('remarkable')
const engineDefaults = require('static-engine-defaults')
const engineParams = require('static-engine-params')
const engineFrontmatter = require('static-engine-frontmatter')
const engineSort = require('static-engine-sort')

const highlighter = new Highlights()

function pages (destination) {
  const frontmatter = engineFrontmatter(cson.parse)
  const remarkable = new Remarkable({
    highlight: function (code, lang) {
      if (!lang) {
        return escape(code)
      }

      code = highlighter.highlightSync({
        fileContents: code.trim(),
        scopeName: 'source.js'
      })

      return code
    },
    langPrefix: 'language-'
  })
  const markdown = function (pages, done) {
    pages.forEach(function (page) {
      page.content = remarkable.render(page.content)

      return page
    })

    done(null, pages)
  }
  const templates = atlatl()
  const renderer = function (name) {
    return function (page, done) {
      templates('./templates/' + name)
      .then(function (template) {
        done(null, template.render(page))
      })
      .catch(done)
    }
  }
  const params = engineParams('./content/:categories+/:date.:slug.md', {
    date: function (date) {
      return moment(date, 'x')
    }
  })
  const sort = engineSort(function (a, b) {
    return b.date.diff(a.date)
  })
  const defaults = engineDefaults('./content/defaults.cson', cson.parse)
  const postPages = [
    read('./content/posts/*'),
    params,
    frontmatter,
    markdown,
    sort,
    pager,
    defaults,
    render(path.join(destination, 'posts/:slug/index.html'), renderer('post.html')),
    first,
    render(path.join(destination, 'index.html'), renderer('post.html'))
  ]
  const archivePage = [
    read('./content/posts.md'),
    frontmatter,
    markdown,
    collection('posts', [
      read('./content/posts/*'),
      params,
      frontmatter,
      markdown,
      sort,
      defaults
    ]),
    defaults,
    render(path.join(destination, 'posts/index.html'), renderer('posts.html'))
  ]
  const _404Page = [
    read('./content/404.md'),
    frontmatter,
    markdown,
    defaults,
    render(path.join(destination, '404.html'), renderer('404.html'))
  ]
  const styleGuidePage = [
    function (pages, done) { return done(null, [{title: 'Style Guide'}]) },
    defaults,
    render(path.join(destination, 'style-guide.html'), renderer('style-guide.html'))
  ]

  return engine(postPages, archivePage, _404Page, styleGuidePage)
}

pages.watch = function (destination) {
  return pages(destination).then(function () {
    chokidar.watch(['templates/**/*.html', 'content/**/*.md', 'content/**/*.cson'], {ignoreInitial: true}).on('all', function () {
      pages(destination).catch(console.error)
    })

    return true
  })
}

module.exports = pages
