#!/usr/bin/env node

'use strict'

const vinylFS = require('vinyl-fs')
const sergeant = require('sergeant')
const chalk = require('chalk')
const bach = require('bach')
const pretty = require('pretty-hrtime')
const extensions = {
  create: function (fn) {
    return { name: fn.name || 'anonymous' }
  },
  before: function (storage) {
    storage.started = process.hrtime()

    console.log(chalk.magenta(storage.name) + ' starting ... ')
  },
  after: function (result, storage) {
    console.log(chalk.magenta(storage.name) + ' finished in ' + chalk.cyan(pretty(process.hrtime(storage.started))))
  }
}
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
const allParallel = bach.parallel(base, bach.series(pages, icons, minifyHTML, css), images, extensions)
const app = sergeant('CMS for erickmerchant.com')

app.command('update', { description: 'Build the site once' }, bach.series(allParallel, gitStatus, extensions))

app.command('watch', { description: 'Build the site then watch for changes. Run a server' }, bach.parallel(allParallel, watch, serve, extensions))

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
  vinylFS.watch(['css/**/*.css', 'templates/**/*.html', 'content/**/*.md'], bach.series(pages, icons, minifyHTML, css, extensions))
}
