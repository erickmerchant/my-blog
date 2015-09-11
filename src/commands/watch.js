'use strict'

const vinylFS = require('vinyl-fs')
const base = require('../tasks/base.js')
const pages = require('../tasks/pages.js')
const icons = require('../tasks/icons.js')
const css = require('../tasks/css.js')
const images = require('../tasks/images.js')
const serve = require('../tasks/serve.js')

module.exports = function (app) {
  app.command('watch')
    .describe('Build the site then watch for changes. Run a server')
    .action(function () {
      vinylFS.watch('base/**/*', base)
      vinylFS.watch('content/uploads/**/*.jpg', images)
      vinylFS.watch('css/**/*.css', css)
      vinylFS.watch(['templates/**/*.html', '!templates/compiled/*.html', 'content/**/*.md', 'content/**/*.cson'], pages)

      return Promise.all([
        base(),
        images(),
        css(),
        pages(),
        icons()
      ])
      .then(serve)
    })
}
