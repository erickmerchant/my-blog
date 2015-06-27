'use strict'

const path = require('path')
const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')
const imageresize = require('gulp-image-resize')
const imagemin = require('gulp-imagemin')
const merge = require('merge-stream')

module.exports = function images () {
  const stream1 = vinylFS.src('content/uploads/*.jpg')
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(vinylFS.dest(path.join(directory, 'uploads')))

  const merged = merge(stream1)

  const stream2 = vinylFS.src('content/uploads/*.jpg')
    .pipe(imageresize({
      width: 622
    }))
    .pipe(imagemin({
      progressive: true
    }))
    .pipe(vinylFS.dest(path.join(directory, 'uploads/thumbnails/')))

  merged.add(stream2)

  return merged
}
