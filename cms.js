#!/usr/bin/env node

'use strict'

const vinylFS = require('vinyl-fs')
const sergeant = require('sergeant')
const chalk = require('chalk')
const bach = require('./lib/extensions/bach.js')
const base = require('./lib/tasks/base.js')
const pages = require('./lib/tasks/pages.js')
const icons = require('./lib/tasks/icons.js')
const css = require('./lib/tasks/css.js')
const gitStatus = require('./lib/tasks/git-status.js')
const minifyHTML = require('./lib/tasks/minify-html.js')
const images = require('./lib/tasks/images.js')
const serve = require('./lib/tasks/serve.js')
const make = require('./lib/tasks/make.js')
const move = require('./lib/tasks/move.js')
const allParallel = bach.parallel(base, bach.series(pages, icons, minifyHTML, css), images)
const app = sergeant('CMS for erickmerchant.com')

app.command('update', { description: 'Build the site once' }, bach.series(allParallel, gitStatus))

app.command('watch', { description: 'Build the site then watch for changes. Run a server' }, bach.parallel(allParallel, watch, serve))

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

app.run(function (err, result) {
  if (err) {
    console.error(chalk.red(err))
  } else {
    if (typeof result === 'string') {
      console.log(result)
    }
  }
})

function watch () {
  vinylFS.watch('base/**/*', base)
  vinylFS.watch('content/uploads/**/*.jpg', images)
  vinylFS.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], bach.series(pages, icons, minifyHTML, css))
}
