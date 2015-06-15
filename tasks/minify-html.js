const path = require('path')
const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')

module.exports = function minifyHTML () {
  const htmlmin = require('gulp-htmlmin')

  return vinylFS.src(path.join(directory, '**/**.html'))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(vinylFS.dest(directory))
}
