const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')

module.exports = function css () {
  const cssnext = require('gulp-cssnext')
  const csso = require('gulp-csso')

  return vinylFS.src('css/site.css')
    .pipe(cssnext({
      features: {
        customProperties: {
          strict: false
        },
        rem: false,
        pseudoElements: false,
        colorRgba: false
      }
    }))
    .pipe(csso())
    .pipe(vinylFS.dest(directory))
}
