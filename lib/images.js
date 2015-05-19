const directory = require('./directory.js')
const path = require('path')
const vinylFS = require('vinyl-fs')

module.exports = function images () {
  const imageresize = require('gulp-image-resize')
  const changed = require('gulp-changed')
  const imagemin = require('gulp-imagemin')
  const merge = require('merge-stream')
  var merged
  var stream = vinylFS.src('content/uploads/*.jpg')
    .pipe(changed(path.join(directory, 'uploads')))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(vinylFS.dest(path.join(directory, 'uploads')))

  merged = merge(stream)

  stream = vinylFS.src('content/uploads/*.jpg')
    .pipe(changed(path.join(directory, 'uploads')))
    .pipe(imageresize({
      width: 622,
      height: 0,
      imageMagick: true
    }))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(vinylFS.dest(path.join(directory, 'uploads/thumbnails/')))

  merged.add(stream)

  return merged
}
