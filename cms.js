#!/usr/bin/env node
'use strict'

const vinylFS = require('vinyl-fs')
const sergeant = require('sergeant')
const chalk = require('chalk')
const base = require('./tasks/base.js')
const pages = require('./tasks/pages.js')
const icons = require('./tasks/icons.js')
const css = require('./tasks/css.js')
const gitStatus = require('./tasks/git-status.js')
const minifyHTML = require('./tasks/minify-html.js')
const images = require('./tasks/images.js')
const serve = require('./tasks/serve.js')
const make = require('./tasks/make.js')
const move = require('./tasks/move.js')
const allParallel = sergeant.parallel(base, sergeant.series(pages, icons, minifyHTML, css), images)
const app = sergeant({ description: 'CMS for erickmerchant.com' })

app.command('update', { description: 'Build the site once' }, sergeant.series(allParallel, gitStatus))

app.command('watch', { description: 'Build the site then watch for changes. Run a server' }, sergeant.parallel(allParallel, watch, serve))

app.command('make', {
  description: 'Make new content',
  options: {
    '--time': 'prepend the unix timestamp'
  },
  aliases: {
    '-t': { time: true }
  }
}, make)

app.command('move', {
  description: 'Move content',
  options: {
    '--title': 'change the title',
    '--time': 'prepend the unix timestamp',
    '--strip': 'remove a unix timestamp if present'
  },
  aliases: {
    '-t': { time: true }
  }
}, move)

app.run()

function watch () {
  vinylFS.watch('base/**/*', base)
  vinylFS.watch('content/uploads/**/*.jpg', images)
  vinylFS.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], sergeant.series(pages, icons, minifyHTML, css))
}
