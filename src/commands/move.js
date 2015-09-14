'use strict'

const chalk = require('chalk')
const moment = require('moment')
const mkslug = require('slug')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

module.exports = function (app) {
  app.command('move')
    .describe('Move content')
    .option('title', 'change the title')
    .option('time', 'prepend the unix timestamp')
    .alias('strip', { time: false })
    .action(function (args, options, done) {
      var newFile
      var ext
      var parts
      var slug
      var time
      var destination
      var directory
      var hasTime = false

      if (!args.file) {
        done(new Error('please provide a file to move'))
      } else {
        destination = args.dir ? args.dir : path.dirname(args.file)

        ext = path.extname(args.file)

        parts = path.basename(args.file, ext).split('.')

        slug = path.basename(args.file, ext)

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
            fs.rename(args.file, newFile, function (err) {
              if (err) {
                done(err)
              } else {
                console.log(chalk.green('%s moved to %s.'), args.file, newFile)

                done()
              }
            })
          }
        })
      }
    })
}
