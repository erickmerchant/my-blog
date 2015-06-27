'use strict'

const sergeant = require('sergeant')
const base = require('../tasks/base.js')
const pages = require('../tasks/pages.js')
const icons = require('../tasks/icons.js')
const css = require('../tasks/css.js')
const gitStatus = require('../tasks/git-status.js')
const minifyHTML = require('../tasks/minify-html.js')
const images = require('../tasks/images.js')
const allParallel = sergeant.parallel(base, sergeant.series(pages, icons, minifyHTML, css), images)

module.exports = function (app) {
  app.command('update', { description: 'Build the site once' }, sergeant.series(allParallel, gitStatus))
}
