#!/usr/bin/env node

'use strict'

const vinylFS = require('vinyl-fs')
const sergeant = require('sergeant')
const bach = require('./lib/extensions/bach.js')
const base = require('./lib/tasks/base.js')
const pages = require('./lib/tasks/pages.js')
const icons = require('./lib/tasks/icons.js')
const css = require('./lib/tasks/css.js')
const insertCSS = require('./lib/tasks/insert-css.js')
const gitStatus = require('./lib/tasks/git-status.js')
const minifyHTML = require('./lib/tasks/minify-html.js')
const shortenSelectors = require('./lib/tasks/shorten-selectors.js')
const images = require('./lib/tasks/images.js')
const serve = require('./lib/tasks/serve.js')
const make = require('./lib/tasks/make.js')
const move = require('./lib/tasks/move.js')
const allParallel = bach.parallel(base, bach.series(bach.parallel(bach.series(pages, icons, minifyHTML), css), shortenSelectors, insertCSS), images)
const app = sergeant('CMS for erickmerchant.com')

app.command('update', 'Build the site once', {}, bach.series(allParallel, gitStatus))

app.command('watch', 'Build the site then watch for changes. Run a server', {}, bach.parallel(allParallel, watch, serve))

app.command('make', 'Make new content', {
  '--time': 'prepend the unix timestamp'
}, make)

app.command('move', 'Move content', {
  '--title': 'change the title',
  '--time': 'prepend the unix timestamp',
  '--strip': 'remove a unix timestamp if present'
}, move)

app.run()

function watch () {
  vinylFS.watch('base/**/*', base)
  vinylFS.watch('content/uploads/**/*.jpg', images)
  vinylFS.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], bach.series(bach.parallel(bach.series(pages, icons, minifyHTML), css), shortenSelectors, insertCSS))
}
