'use strict'

const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')

module.exports = function base () {
  return vinylFS.src('base/**').pipe(vinylFS.dest(directory))
}
