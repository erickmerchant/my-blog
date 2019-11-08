#!/usr/bin/env node
const {command, start} = require('sergeant')('cli.js')
const promisify = require('util').promisify
const jsonfile = require('jsonfile')
const fs = require('fs')
const path = require('path')
const writeJSON = promisify(jsonfile.writeFile)
const writeFile = promisify(fs.writeFile)
const readJSON = promisify(jsonfile.readFile)
const globby = require('globby')
const slugify = (title) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')

command({
  name: 'post',
  description: 'make a new post',
  options: {
    title: {
      description: 'the title',
      parameter: true,
      required: true
    },
    t: 'title'
  },
  async action(args) {
    const title = args.title
    const slug = slugify(title)

    const post = {
      date: Date.now(),
      title,
      slug
    }

    const posts = await readJSON('./src/content/posts/index.json', 'utf8')

    posts.push(post)

    await writeJSON('./src/content/posts/index.json', posts, {spaces: 2})

    await writeFile(`./src/content/posts/${slug}.md`, '')
  }
})

command({
  name: 'postbuild',
  async action() {
    const posts = require('./dist/content/posts/index.json')
    const files = await globby('./dist/**/*.{css,mjs}')
    const headers = [
      '  Link: </content/posts/index.json>; rel=preload; as=fetch; crossorigin=anonymous'
    ]

    for (const file of files) {
      const relative = `/${path.relative('./dist', file)}`

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
  }
})

start(process.argv.slice(2))
