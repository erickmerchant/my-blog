'use strict'

const git = require('gulp-git')
const directory = require('./directory.js')

module.exports = function gitStatus (cb) {
  git.status({args: '--porcelain', cwd: directory, quiet: true}, function (err, out) {
    if (err) {
      throw err
    }

    if (out) {
      console.log(out.trimRight())
    }

    cb()
  })
}
