#!/usr/bin/env node

'use strict'

var program = require('commander')
var chalk = require('chalk')
var moment = require('moment')
var mkslug = require('slug')
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var cson = require('cson-parser')

var orig = console.error

console.error = function (error) {
  var args = [].slice.call(arguments)

  if (error) {
    args[0] = chalk.red(error)
  }

  orig.apply(undefined, args)
}

console.success = function (message) {
  var args = [].slice.call(arguments)

  if (message) {
    args[0] = chalk.green(message)
  }

  console.log.apply(undefined, args)
}

program
  .command('make <dir> <title>')
  .description('Make new content.')
  .option('--time', 'prepend the unix timestamp')
  .action(function (dir, title, options) {
    var file
    var content

    file = mkslug(title).toLowerCase()

    if (options.time) {
      file = [moment().format('x'), file].join('.')
    }

    file += '.md'

    if (dir) {
      file = path.join(dir, file)
    }

    content = ['---', cson.stringify({title: title}, null, '  '), '---', ''].join('\n')

    var directory = path.dirname(file)

    mkdirp(directory, function (err) {
      if (err) {
        console.error(err)
      } else {
        fs.writeFile(file, content, function (err) {
          if (err) {
            console.error(err)
          } else {
            console.success('%s saved.', file)
          }
        })
      }
    })
  })

program
  .command('move <file> <dir>')
  .description('Move content')
  .option('--title', 'change the title')
  .option('--time', 'prepend the unix timestamp')
  .option('--strip', 'remove a unix timestamp if present')
  .action(function (file, dir, options) {
    var newFile
    var ext
    var parts
    var slug
    var time
    var destination
    var directory
    var hasTime = false

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
        console.error(err)
      } else {
        fs.rename(file, newFile, function (err) {
          if (err) {
            console.error(err)
          } else {
            console.success('%s moved to %s.', file, newFile)
          }
        })
      }
    })
  })

program.parse(process.argv)
