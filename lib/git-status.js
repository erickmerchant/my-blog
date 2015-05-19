const directory = require('./directory.js')

module.exports = function gitStatus (cb) {
  const git = require('gulp-git')

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
