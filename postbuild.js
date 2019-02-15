const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const writeFile = promisify(fs.writeFile)
const globby = require('globby')

;(async () => {
  const posts = require('./dist/content/posts/index.json')
  const files = await globby('./dist/**/*.{css,mjs}')
  const headers = [
    '  Link: </content/posts/index.json>; rel=preload; as=fetch; crossorigin=anonymous'
  ]

  for (const file of files) {
    const relative = path.relative('./dist', file)

    switch (path.extname(relative)) {
      case '.css':
        headers.push(`  Link: </${relative}>; rel=preload; as=style`)
        break

      case '.mjs':
        headers.push(`  Link: </${relative}>; rel=preload; as=script; crossorigin=anonymous`)
        break
    }
  }

  const lines = []

  lines.push('/')

  if (posts.length) {
    lines.push(`  Link: </content/posts/${posts[posts.length - 1].slug}.md>; rel=preload; as=fetch; crossorigin=anonymous`)
  }

  lines.push(...headers)

  for (const post of posts) {
    lines.push(`/posts/${post.slug}`, `  Link: </content/posts/${post.slug}.md>; rel=preload; as=fetch; crossorigin=anonymous`, ...headers)
  }

  await writeFile('./dist/_headers', lines.join('\n'))
})()
