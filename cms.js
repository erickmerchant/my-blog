#!/usr/bin/env node
'use strict'

const vinylFS = require('vinyl-fs')
const sergeant = require('sergeant')
const order = require('./lib/order.js')
const base = require('./lib/base.js')
const pages = require('./lib/pages.js')
const icons = require('./lib/icons.js')
const css = require('./lib/css.js')
const insertCSS = require('./lib/insert-css.js')
const gitStatus = require('./lib/git-status.js')
const minifyHTML = require('./lib/minify-html.js')
const shortenSelectors = require('./lib/shorten-selectors.js')
const images = require('./lib/images.js')
const serve = require('./lib/serve.js')
const make = require('./lib/make.js')
const move = require('./lib/move.js')
const allParallel = order.parallel(base, order.series(order.parallel(order.series(pages, icons, minifyHTML), css), shortenSelectors, insertCSS), images)
const app = sergeant('CMS for erickmerchant.com', process.argv.slice(2))

app.command('update', 'Build the site once', {}, order.series(allParallel, gitStatus))

app.command('watch', 'Build the site then watch for changes. Run a server', {}, order.parallel(allParallel, watch, serve))

app.command('make <dir> <title>', 'Make new content', {
  '--time': 'prepend the unix timestamp'
}, make)

app.command('move <file> <dir>', 'Move content', {
  '--title': 'change the title',
  '--time': 'prepend the unix timestamp',
  '--strip': 'remove a unix timestamp if present'
}, move)

function watch () {
  vinylFS.watch('base/**/*', base)
  vinylFS.watch('content/uploads/**/*.jpg', images)
  vinylFS.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], order.series(order.parallel(order.series(pages, icons, minifyHTML), css), shortenSelectors, insertCSS))
}

app.run()
