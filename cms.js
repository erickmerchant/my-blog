'use strict'

const sergeant = require('sergeant')
const app = sergeant().describe('CMS for erickmerchant.com')
const commands = ['update', 'watch', 'move', 'make']

commands.forEach(function (command) {
  require('./src/commands/' + command + '.js')(app)
})

app.run()
