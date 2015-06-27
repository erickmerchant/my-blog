'use strict'

const path = require('path')
const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')
const htmlmin = require('gulp-htmlmin')

module.exports = function minifyHTML () {
  return vinylFS.src(path.join(directory, '**/**.html'))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(vinylFS.dest(directory))
}
