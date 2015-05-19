const directory = require('./directory.js')
const path = require('path')
const vinylFS = require('vinyl-fs')

module.exports = function minifyHTML () {
  const htmlmin = require('gulp-htmlmin')

  return vinylFS.src(path.join(directory, '**/**.html'))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(vinylFS.dest(directory))
}
