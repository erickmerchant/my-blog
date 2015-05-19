const directory = require('./directory.js')
const vinylFS = require('vinyl-fs')

module.exports = function css () {
  const cssnext = require('gulp-cssnext')

  return vinylFS.src('css/site.css')
    .pipe(cssnext({
      features: {
        customProperties: {
          strict: false
        },
        rem: false,
        pseudoElements: false,
        colorRgba: false
      },
      browsers: ['> 5%', 'last 2 versions']
    }))
    .pipe(vinylFS.dest(directory))
}
