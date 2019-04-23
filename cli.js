#!/usr/bin/env node
const {command, start} = require('sergeant')('cli.js')
const promisify = require('util').promisify
const jsonfile = require('jsonfile')
const fs = require('fs')
const path = require('path')
const writeJSON = promisify(jsonfile.writeFile)
const writeFile = promisify(fs.writeFile)
const rename = promisify(fs.rename)
const readJSON = promisify(jsonfile.readFile)
const slugify = (title) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')

command(['draft'], ({option, description}) => {
  description('make a new draft')

  option({
    name: 'title',
    description: 'the title',
    type: (value) => value,
    required: true,
    alias: 't'
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

    const posts = await readJSON('./src/content/posts/index.json', 'utf8')

    posts.push(draft)

    await writeJSON('./src/content/posts/index.json', posts, {spaces: 2})

    await writeFile(`./src/content/posts/${slug}.md`, '')
  }
})

command(['publish'], ({parameter, option, description}) => {
  description('publish a post')

  parameter({
    name: 'content',
    description: 'the md file',
    type: (value) => value,
    required: true
  })

  option({
    name: 'title',
    description: 'a new title',
    type: (value) => value,
    alias: 't'
  })

  return async (args) => {
    const posts = await readJSON('./src/content/posts/index.json', 'utf8')

    const index = posts.findIndex((post) => post.slug === path.basename(args.content, '.md'))

    const post = posts[index]

    post.date = Date.now()

    post.draft = false

    if (args.title != null) {
      post.title = args.title
      post.slug = slugify(post.title)
    }

    posts.splice(index, 1)

    posts.push(post)

    await writeJSON('./src/content/posts/index.json', posts, {spaces: 2})

    await rename(`./src/content/posts/${path.basename(args.content)}`, `./src/content/posts/${post.slug}.md`)
  }
})

start(process.argv.slice(2))
