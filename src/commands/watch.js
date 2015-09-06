'use strict'

const vinylFS = require('vinyl-fs')
const sergeant = require('sergeant')
const base = require('../tasks/base.js')
const pages = require('../tasks/pages.js')
const icons = require('../tasks/icons.js')
const css = require('../tasks/css.js')
const minifyHTML = require('../tasks/minify-html.js')
const images = require('../tasks/images.js')
const serve = require('../tasks/serve.js')
const allParallel = sergeant.parallel(base, sergeant.series(pages, icons, minifyHTML, css), images)

module.exports = function (app) {
  app.command('watch', { description: 'Build the site then watch for changes. Run a server' }, watch)
}

function watch (options, done) {
  vinylFS.watch('base/**/*', base)
  vinylFS.watch('content/uploads/**/*.jpg', images)
  vinylFS.watch(['css/**/*.css', 'templates/**/*.html', '!templates/compiled/*.html', 'content/**/*.md', 'content/**/*.cson'], function () {
    sergeant.series(pages, icons, minifyHTML, css)(options, function () {})
  })

  sergeant.parallel(allParallel, serve)(options, done)
}
