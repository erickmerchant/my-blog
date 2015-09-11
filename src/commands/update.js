'use strict'

const base = require('../tasks/base.js')
const pages = require('../tasks/pages.js')
const icons = require('../tasks/icons.js')
const css = require('../tasks/css.js')
const optimize = require('../tasks/optimize.js')
const images = require('../tasks/images.js')

module.exports = function (app) {
  app.command('update')
    .describe('Build the site once')
    .action(function () {
      return Promise.all([
        base(),
        images(),
        Promise.all([pages(), icons(), css()]).then(optimize)
      ])
    })
}
