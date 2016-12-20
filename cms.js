'use strict'

const sergeant = require('sergeant')
const assert = require('assert')
const chalk = require('chalk')
const moment = require('moment')
const mkslug = require('slug')
const thenify = require('thenify')
const fs = require('fs')
const path = require('path')
const cson = require('cson-parser')
const base = require('./tasks/base.js')
const pages = require('./tasks/pages.js')
const icons = require('./tasks/icons.js')
const css = require('./tasks/css.js')
const images = require('./tasks/images.js')
const serve = require('./tasks/serve.js')
const optimize = require('./tasks/optimize.js')
const fsWriteFile = thenify(fs.writeFile)
const fsRename = thenify(fs.rename)
const mkdirp = thenify(require('mkdirp'))
const app = sergeant().describe('CMS for erickmerchant.com')

app.command('make')
.describe('Make new content')
.option('time', 'prepend the unix timestamp')
.parameter('dir', 'where is it')
.parameter('title', 'what is it called')
.action(function (args) {
  var file
  var content

  if (!args.has('title') || !args.has('dir')) {
    throw new Error('please provide a target dir and title')
  }

  file = mkslug(args.get('title')).toLowerCase()

  if (args.has('time')) {
    file = [moment().format('x'), file].join('.')
  }

  file += '.md'

  if (args.has('dir')) {
    file = path.join(args.get('dir'), file)
  }

  content = ['---', cson.stringify({title: args.get('title'), summary: ''}, null, '  '), '---', ''].join('\n')

  return mkdirp(path.dirname(file))
  .then(function () {
    return fsWriteFile(file, content)
    .then(function () {
      console.log(chalk.green('%s saved.'), file)
    })
  })
})

app.command('move')
.describe('Move content')
.option('title', 'change the title')
.option('time', 'prepend the unix timestamp')
.parameter('file', 'the file to move')
.parameter('dir', 'where to move it to')
.action(function (args) {
  var newFile
  var ext
  var parts
  var slug
  var time
  var destination
  var directory
  var hasTime = false

  if (!args.has('file')) {
    throw new Error('please provide a file to move')
  }

  destination = args.has('dir') ? args.get('dir') : path.dirname(args.get('file'))

  ext = path.extname(args.get('file'))

  parts = path.basename(args.get('file'), ext).split('.')

  slug = path.basename(args.get('file'), ext)

  time = moment()

  if (parts.length >= 2) {
    if (moment(parts[0], ['x']).isValid()) {
      hasTime = true

      time = moment(parts[0], ['x'])

      slug = parts.slice(1).join('.')
    }
  }

  if (args.has('title')) {
    slug = mkslug(args.get('title')).toLowerCase()
  }

  newFile = slug + ext

  if (hasTime && args.has('time')) {
    newFile = [time.format('x'), newFile].join('.')
  }

  newFile = path.join(destination, newFile)

  directory = path.dirname(newFile)

  return mkdirp(directory)
  .then(function () {
    return fsRename(args.get('file'), newFile, function () {
      console.log(chalk.green('%s moved to %s.'), args.get('file'), newFile)
    })
  })
})

app.command('update')
.describe('Build the site once')
.parameter('destination', 'where to build everything')
.action(function (args) {
  assert.ok(args.has('destination'), 'destination is required')
  assert.equal(typeof args.get('destination'), 'string', 'destination should be a string')

  var dest = args.get('destination')

  return Promise.all([
    mkdirp(dest),
    base(dest),
    images(dest),
    pages(dest),
    icons(dest),
    css(dest)
  ]).then(optimize(dest))
})

app.command('watch')
.describe('Build the site then watch for changes. Run a server')
.parameter('destination', 'where to build everything')
.action(function (args) {
  assert.ok(args.has('destination'), 'destination is required')
  assert.equal(typeof args.get('destination'), 'string', 'destination should be a string')

  var dest = args.get('destination')

  Promise.all([
    mkdirp(dest),
    base.watch(dest),
    images.watch(dest),
    pages.watch(dest),
    icons.watch(dest),
    css.watch(dest)
  ])
  .then(serve(dest))
})

app.command('preview')
.describe('Preview the built site')
.parameter('destination', 'where to build everything')
.action(function (args) {
  assert.ok(args.has('destination'), 'destination is required')
  assert.equal(typeof args.get('destination'), 'string', 'destination should be a string')

  var dest = args.get('destination')

  serve(dest)()
})

app.run().catch(function (err) {
  console.error(chalk.red(err.message))
})
