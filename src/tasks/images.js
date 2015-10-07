'use strict'

const path = require('path')
const vinylFS = require('vinyl-fs')
const directory = require('./directory.js')
const sharp = require('sharp')
const imagemin = require('gulp-imagemin')
const glob = require('glob')
const mkdirp = require('mkdirp')

module.exports = function images () {
  return (new Promise(function (resolve, reject) {
    mkdirp(path.join(directory, 'uploads/thumbnails/'), function (err) {
      if (err) throw err

      glob('content/uploads/*.jpg', function (err, files) {
        if (err) throw err

        resolve(Promise.all(files.map(function (file) {
          return sharp(file).resize(622).toFile(path.join(directory, 'uploads/thumbnails/', path.basename(file)))
        })))
      })
    })
  }))
  .then(function () {
    return new Promise(function (resolve, reject) {
      vinylFS.src(['content/uploads/**/*.jpg', 'content/uploads/*.jpg'])
        .pipe(imagemin({
          progressive: true
        }))
        .pipe(vinylFS.dest(path.join(directory, 'uploads')))
        .once('end', resolve)
        .on('error', reject)
    })
  })
}
