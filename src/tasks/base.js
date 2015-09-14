'use strict'

const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')

module.exports = function base () {
  return new Promise(function (resolve, reject) {
    vinylFS.src('base/**')
      .pipe(vinylFS.dest(directory))
      .once('end', resolve)
      .on('error', reject)
  })
}
