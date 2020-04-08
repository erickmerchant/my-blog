#!/usr/bin/env node
const {command, start} = require('sergeant')('cli.js')
const promisify = require('util').promisify
const fs = require('fs')
const path = require('path')
const del = require('del')
const writeFile = promisify(fs.writeFile)
const globby = require('globby')
const execa = require('execa')
const execaOptions = {shell: true, stdio: 'inherit', cwd: process.cwd()}

// require('@erickmerchant/css')
// require('@erickmerchant/dev-cli')

command({
  name: 'start',
  async action() {
    execa('css src/styles.mjs src/css/styles -wd', execaOptions)

    execa('css src/editor/styles.mjs src/editor/css/styles -wd', execaOptions)

    execa('dev serve src', execaOptions)
  }
})

command({
  name: 'build',
  async action() {
    await Promise.all([
      execa('css src/styles.mjs src/css/styles', execaOptions),
      execa('dev cache src dist', execaOptions)
    ])

    const posts = require('./dist/content/posts/index.json')
    const files = await globby('./dist/**/*.{mjs,css,woff2}')
    const headers = [
      '  Link: </content/posts/index.json>; rel=preload; as=fetch; crossorigin=anonymous'
    ]

    for (const file of files) {
      const relative = `/${path.relative('./dist', file)}`

      if (relative === '/styles.mjs') continue

      switch (path.extname(relative)) {
        case '.css':
          headers.push(`  Link: <${relative}>; rel=preload; as=style`)
          break

          case '.mjs':
          headers.push(`  Link: <${relative}>; rel=preload; as=script; crossorigin=anonymous`)
          break

          case '.woff2':
          headers.push(`  Link: <${relative}>; rel=preload; as=font; crossorigin=anonymous`)
          break
      }
    }

    const lines = []

    lines.push('/')

    if (posts.length) {
      lines.push(`  Link: </content/posts/${posts[posts.length - 1].slug}.json>; rel=preload; as=fetch; crossorigin=anonymous`)
    }

    lines.push(...headers, '')

    for (const post of posts) {
      lines.push(`/posts/${post.slug}`, `  Link: </content/posts/${post.slug}.json>; rel=preload; as=fetch; crossorigin=anonymous`, ...headers, '')
    }

    await writeFile('./dist/_headers', lines.join('\n'))

    await del(['./dist/editor/'])
  }
})

start(process.argv.slice(2))
