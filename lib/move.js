'use strict'

var chalk = require('chalk')
var moment = require('moment')
var mkslug = require('slug')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')

module.exports = function move (done) {
  var newFile
  var ext
  var parts
  var slug
  var time
  var destination
  var directory
  var hasTime = false

  destination = this.dir ? this.dir : path.dirname(this.file)

  ext = path.extname(this.file)

  parts = path.basename(this.file, ext).split('.')

  slug = path.basename(this.file, ext)

  time = moment()

  if (parts.length >= 2) {
    if (moment(parts[0], ['x']).isValid()) {
      hasTime = true

      time = moment(parts[0], ['x'])

      slug = parts.slice(1).join('.')
    }
  }

  if (this.options.title) {
    slug = mkslug(this.options.title).toLowerCase()
  }

  newFile = slug + ext

  if ((this.options.time || hasTime) && !this.options.strip) {
    newFile = [time.format('x'), newFile].join('.')
  }

  newFile = path.join(destination, newFile)

  directory = path.dirname(newFile)

  mkdirp(directory, function (err) {
    if (err) {
      done(err)
    } else {
      fs.rename(this.file, newFile, function (err) {
        if (err) {
          done(err)
        } else {
          console.log(chalk.green('%s moved to %s.'), this.file, newFile)

          done()
        }
      }.bind(this))
    }
  }.bind(this))
}
