const directory = require('./directory.js')
const vinylFS = require('vinyl-fs')

module.exports = function base () {
  return vinylFS.src('base/**').pipe(vinylFS.dest(directory))
}
