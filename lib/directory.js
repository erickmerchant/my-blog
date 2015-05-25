const sergeant = require('sergeant')
const argv = sergeant.parse(process.argv.slice(2))

module.exports = argv[argv.length - 1].dir || '../erickmerchant.github.io'
