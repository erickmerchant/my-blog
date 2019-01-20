const fs = require('fs')
const path = require('path')
const promisify = require('util').promisify
const writeFile = promisify(fs.writeFile)
const globby = require('globby')

;(async () => {
  const files = await globby('./dist/**/*.{css,mjs}')
  const headers = ['  Link: </content/posts/index.json>; rel=preload; as=fetch']

  for (const file of files) {
    const relative = path.relative('./dist', file)

    switch (path.extname(relative)) {
      case '.css':
        headers.push(`  Link: </${relative}>; rel=preload; as=style`)
        break

      case '.mjs':
        headers.push(`  Link: </${relative}>; rel=modulepreload; as=script`)
        break
    }
  }

  const lines = []

  for (const path of ['/', '/posts/*']) {
    lines.push(path, ...headers)
  }

  const posts = await globby('./dist/content/posts/*.md')

  for (const post of posts) {
    const relative = path.relative('./dist', post)
    const slug = path.basename(post, '.md')

    lines.push(`/posts/${slug}`, `  Link: </${relative}>; rel=preload; as=fetch`)
  }

  await writeFile('./dist/_headers', lines.join('\n'))
})()
