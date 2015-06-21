'use strict'

var chalk = require('chalk')
var moment = require('moment')
var mkslug = require('slug')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')

module.exports = function (app) {
  app.command('move', {
    description: 'Move content',
    options: {
      '--title': 'change the title',
      '--time': 'prepend the unix timestamp',
      '--strip': 'remove a unix timestamp if present'
    },
    aliases: {
      '-t': { time: true }
    }
  }, move)
}

function move (file, dir, options, done) {
  var newFile
  var ext
  var parts
  var slug
  var time
  var destination
  var directory
  var hasTime = false

  if (!file) {
    done(new Error('please provide a file to move'))
  } else {
    destination = dir ? dir : path.dirname(file)

    ext = path.extname(file)

    parts = path.basename(file, ext).split('.')

    slug = path.basename(file, ext)

    time = moment()

    if (parts.length >= 2) {
      if (moment(parts[0], ['x']).isValid()) {
        hasTime = true

        time = moment(parts[0], ['x'])

        slug = parts.slice(1).join('.')
      }
    }

    if (options.title) {
      slug = mkslug(options.title).toLowerCase()
    }

    newFile = slug + ext

    if ((options.time || hasTime) && !options.strip) {
      newFile = [time.format('x'), newFile].join('.')
    }

    newFile = path.join(destination, newFile)

    directory = path.dirname(newFile)

    mkdirp(directory, function (err) {
      if (err) {
        done(err)
      } else {
        fs.rename(file, newFile, function (err) {
          if (err) {
            done(err)
          } else {
            console.log(chalk.green('%s moved to %s.'), file, newFile)

            done()
          }
        })
      }
    })
  }
}
