#!/usr/bin/env node
'use strict'

const sergeant = require('sergeant')
const app = sergeant({ description: 'CMS for erickmerchant.com' })

require('./src/commands/update.js')(app)
require('./src/commands/watch.js')(app)
require('./src/commands/move.js')(app)
require('./src/commands/make.js')(app)

app.run()
