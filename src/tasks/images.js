'use strict'

const path = require('path')
const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')
const imageresize = require('gulp-image-resize')
const imagemin = require('gulp-imagemin')

module.exports = function images () {
  return Promise.all([
    new Promise(function (resolve, reject) {
      vinylFS.src('content/uploads/*.jpg')
        .pipe(imagemin({
          progressive: true
        }))
        .pipe(vinylFS.dest(path.join(directory, 'uploads')))
        .once('end', resolve)
        .on('error', reject)
    }),
    new Promise(function (resolve, reject) {
      vinylFS.src('content/uploads/*.jpg')
        .pipe(imageresize({
          width: 622
        }))
        .pipe(imagemin({
          progressive: true
        }))
        .pipe(vinylFS.dest(path.join(directory, 'uploads/thumbnails/')))
        .once('end', resolve)
        .on('error', reject)
    })
  ])
}
