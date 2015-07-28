'use strict'

module.exports = function pages () {
  const path = require('path')
  const directory = require('./directory.js')
  const atlatl = require('atlatl')
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
  const engineDefaults = require('static-engine-defaults')
  const engineParams = require('static-engine-params')
  const engineFrontmatter = require('static-engine-frontmatter')
  const engineSort = require('static-engine-sort')
  const frontmatter = engineFrontmatter(cson.parse)
  const remarkable = new Remarkable({
    highlight: function (code) {
      return hljs.highlightAuto(code).value
    },
    langPrefix: 'lang-'
  })
  const markdown = function (pages, done) {
    pages.forEach(function (page) {
      page.content = remarkable.render(page.content)

      return page
    })

    done(null, pages)
  }
  const loader = atlatl('./templates/')
  const renderer = function (name) {
    return function (page, done) {
      loader(name, page, done)
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
    render(path.join(directory, 'posts/:slug/index.html'), renderer('post')),
    first,
    render(path.join(directory, 'index.html'), renderer('post'))
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
      sort
    ]),
    defaults,
    render(path.join(directory, 'posts/index.html'), renderer('posts'))
  ]
  const _404Page = [
    read('./content/404.md'),
    frontmatter,
    markdown,
    defaults,
    render(path.join(directory, '404.html'), renderer('unfound'))
  ]
  
  return engine(postPages, archivePage, _404Page)
}
