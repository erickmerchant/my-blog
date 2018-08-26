const fs = require('fs')

let fetch

if (typeof window !== 'undefined') {
  fetch = function (url) {
    return window.fetch(url).then((response) => {
      if (url.endsWith('.json')) return response.json()

      return response.text()
    })
  }
} else {
  fetch = function (url) {
    return new Promise(function (resolve, reject) {
      fs.readFile('./dist' + url, 'utf8', function (err, response) {
        if (err) {
          reject(err)
        } else if (url.endsWith('.json')) {
          resolve(JSON.parse(response))
        } else {
          resolve(response)
        }
      })
    })
  }
}

module.exports = fetch
