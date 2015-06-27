#!/usr/bin/env node
'use strict'

const sergeant = require('sergeant')
const app = sergeant({ description: 'CMS for erickmerchant.com' })
const commands = ['update', 'watch', 'move', 'make']

commands.forEach(function (command) {
  require('./src/commands/' + command + '.js')(app)
})

app.run()
