'use strict'

const chalk = require('chalk')
const moment = require('moment')
const mkslug = require('slug')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

module.exports = function (app) {
  app.command('move', {
    description: 'Move content',
    options: {
      '--title': 'change the title',
      '--time': 'prepend the unix timestamp'
    },
    aliases: {
      'strip': { time: false }
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

    if (hasTime && options.time !== false || options.time) {
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
