const fs = require('fs')

let fetch

if (typeof window !== 'undefined') {
  fetch = function (url) {
    return window.fetch(url).then((response) => response.json())
  }
} else {
  fetch = function (url) {
    return new Promise(function (resolve, reject) {
      fs.readFile('./dist' + url, 'utf8', function (err, response) {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(response))
        }
      })
    })
  }
}

module.exports = fetch
