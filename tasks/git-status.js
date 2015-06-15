module.exports = function gitStatus (cb) {
  const git = require('gulp-git')
  const directory = require('./directory.js')

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
