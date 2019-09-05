const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const writeFile = promisify(fs.writeFile)
const globby = require('globby')
const version = require('./package.json').version

;(async () => {
  const posts = require('./dist/content/posts/index.json')
  const files = await globby('./dist/**/*.{css,mjs}')
  const headers = [
    '  Link: </content/posts/index.json>; rel=preload; as=fetch; crossorigin=anonymous'
  ]
  const relatives = []

  for (const file of files) {
    const relative = `/${path.relative('./dist', file)}`

    relatives.push(relative)

    switch (path.extname(relative)) {
      case '.css':
        headers.push(`  Link: <${relative}>; rel=preload; as=style`)
        break

      case '.mjs':
        headers.push(`  Link: <${relative}>; rel=preload; as=script; crossorigin=anonymous`)
        break
    }
  }

  const lines = []

  lines.push('/')

  if (posts.length) {
    lines.push(`  Link: </content/posts/${posts[posts.length - 1].slug}.md>; rel=preload; as=fetch; crossorigin=anonymous`)
  }

  lines.push(...headers, '')

  for (const post of posts) {
    lines.push(`/posts/${post.slug}`, `  Link: </content/posts/${post.slug}.md>; rel=preload; as=fetch; crossorigin=anonymous`, ...headers, '')
  }

  await writeFile('./dist/_headers', lines.join('\n'))

  await writeFile('./dist/sw.js', `
    const version = ${JSON.stringify(version)} || '1'
    const assets = ${JSON.stringify(relatives)}

    self.addEventListener('install', (event) => {
      event.waitUntil(
        caches.open(version).then((cache) => cache.addAll(assets))
      )
    })

    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches.keys().then((keys) => Promise.all(
          keys.map((key) => {
            if (key !== version) {
              return caches.delete(key)
            }
          })
        ))
      )
    })

    self.addEventListener('fetch', (event) => {
      const url = new URL(event.request.url)

      if (assets.includes(url.pathname)) {
        event.respondWith(caches.match(url.pathname))
      }
    })
  `)
})()
