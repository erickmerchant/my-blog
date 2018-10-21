#!/usr/bin/env node
const command = require('sergeant')
const promisify = require('util').promisify
const jsonfile = require('jsonfile')
const fs = require('fs')
const path = require('path')
const writeJSON = promisify(jsonfile.writeFile)
const writeFile = promisify(fs.writeFile)
const rename = promisify(fs.rename)
const readJSON = promisify(jsonfile.readFile)

command('cli.js', 'draft and publish content', ({ command }) => {
  command('draft', 'make a new draft', ({ parameter }) => {
    parameter('title', {
      description: 'the title',
      type: (value) => value,
      required: true
    })

    return async (args) => {
      const title = args.title
      const slug = slugify(title)

      const draft = {
        date: Date.now(),
        title,
        slug,
        draft: true
      }

      const posts = await readJSON('./content/_posts/index.json', 'utf8')

      posts.push(draft)

      await writeJSON('./content/_posts/index.json', posts, { spaces: 2 })

      await writeFile('./content/_posts/' + slug + '.html', '')
    }
  })

  command('publish', 'publish a post', ({ parameter }) => {
    parameter('content', {
      description: 'the html file',
      type: (value) => value,
      required: true
    })

    parameter('title', {
      description: 'a new title',
      type: (value) => value
    })

    return async (args) => {
      const posts = await readJSON('./content/_posts/index.json', 'utf8')

      const index = posts.findIndex((post) => post.slug === path.basename(args.content, '.html'))

      const post = posts[index]

      post.date = Date.now()

      post.draft = false

      if (args.title != null) {
        post.title = args.title
        post.slug = slugify(post.title)
      }

      posts.splice(index, 1)

      posts.push(post)

      await writeJSON('./content/_posts/index.json', posts, { spaces: 2 })

      await rename('./content/_posts/' + path.basename(args.content), './content/_posts/' + post.slug + '.html')
    }
  })
})(process.argv.slice(2))

function slugify (title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')
}
