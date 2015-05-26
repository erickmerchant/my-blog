const path = require('path')
const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')

module.exports = function images () {
  const imageresize = require('gulp-image-resize')
  const imagemin = require('gulp-imagemin')
  const merge = require('merge-stream')
  var merged
  var stream = vinylFS.src('content/uploads/*.jpg')
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(vinylFS.dest(path.join(directory, 'uploads')))

  merged = merge(stream)

  stream = vinylFS.src('content/uploads/*.jpg')
    .pipe(imageresize({
      width: 622
    }))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(vinylFS.dest(path.join(directory, 'uploads/thumbnails/')))

  merged.add(stream)

  return merged
}
