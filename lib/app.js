'use strict'

const vinylFS = require('vinyl-fs')
const sergeant = require('sergeant')
const chalk = require('chalk')
const bach = require('./bach-extended.js')
const base = require('./base.js')
const pages = require('./pages.js')
const icons = require('./icons.js')
const css = require('./css.js')
const insertCSS = require('./insert-css.js')
const gitStatus = require('./git-status.js')
const minifyHTML = require('./minify-html.js')
const shortenSelectors = require('./shorten-selectors.js')
const images = require('./images.js')
const serve = require('./serve.js')
const make = require('./make.js')
const move = require('./move.js')
const allParallel = bach.parallel(base, bach.series(bach.parallel(bach.series(pages, icons, minifyHTML), css), shortenSelectors, insertCSS), images)
const app = sergeant('CMS for erickmerchant.com', null, function (err) {
  if (err) {
    console.error(chalk.red(err.stack))
  }
})

app.command('update', 'Build the site once', {}, bach.series(allParallel, gitStatus))

app.command('watch', 'Build the site then watch for changes. Run a server', {}, bach.parallel(allParallel, watch, serve))

app.command('make <dir> <title>', 'Make new content', {
  '--time': 'prepend the unix timestamp'
}, make)

app.command('move <file> <dir>', 'Move content', {
  '--title': 'change the title',
  '--time': 'prepend the unix timestamp',
  '--strip': 'remove a unix timestamp if present'
}, move)

app.end()

function watch () {
  vinylFS.watch('base/**/*', base)
  vinylFS.watch('content/uploads/**/*.jpg', images)
  vinylFS.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], bach.series(bach.parallel(bach.series(pages, icons, minifyHTML), css), shortenSelectors, insertCSS))
}
