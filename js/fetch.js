const fs = require('fs')

let fetch

if (typeof window !== 'undefined') {
  fetch = async (url) => {
    const response = await window.fetch(url)

    if (url.endsWith('.json')) return response.json()

    return response.text()
  }
} else {
  fetch = (url) => {
    return new Promise((resolve, reject) => {
      fs.readFile('./dist' + url, 'utf8', (err, response) => {
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
