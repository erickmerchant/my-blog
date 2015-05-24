const sergeant = require('sergeant')
const argv = sergeant.parse(process.argv.slice(2))

module.exports = argv.options.dir || '../erickmerchant.github.io'
