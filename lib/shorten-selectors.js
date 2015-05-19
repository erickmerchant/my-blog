const directory = require('./directory.js')
const vinylFS = require('vinyl-fs')
const path = require('path')

module.exports = function shortenSelectors () {
  const selectors = require('gulp-selectors')

  return vinylFS.src([path.join(directory, '**/**.html'), path.join(directory, 'site.css')])
    .pipe(selectors.run(undefined, {ids: '*'}))
    .pipe(vinylFS.dest(directory))
}
