#!/usr/bin/env node
import {promisify} from 'util'
import fs from 'fs'
import {stringify} from '@erickmerchant/framework/stringify.js'
import {html} from '@erickmerchant/framework/main.js'
import {createIndexView} from './src/views/index.js'
import {createLayoutView} from './src/views/layout.js'
import {createAboutView} from './src/views/about.js'
import {createContentView} from './src/common.js'
import {spawn} from 'sergeant'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const command = process.argv[2]

const program = async () => {
  try {
    if (command === 'start') {
      spawn`css src/styles.js dist/css -dw src`

      spawn`css src/editor/styles.js dist/editor/css -dw src/editor`

      spawn`dev serve src dist -de dev.html`
    }

    if (command === 'build') {
      await Promise.all([
        spawn`css src/styles.js dist/css`,
        spawn`dev cache src dist -i src/editor.html -i src/dev.html -i src/styles.js -i src/editor/styles.js`
      ])

      const {layoutClasses, aboutClasses} = await import('./dist/css/styles.js')

      const state = {title: ''}

      const aboutView = createAboutView({
        classes: aboutClasses,
        createContentView
      })

      const layoutView = createLayoutView({
        classes: layoutClasses,
        aboutView,
        mainView: () =>
          html`
            <article id="main"></article>
          `,
        anchorAttrs: (href) => {
          return {href}
        }
      })

      const indexView = createIndexView({layoutView})

      state.styles = await readFile('./dist/css/styles.css', 'utf8')

      await writeFile(
        './dist/index.html',
        `<!doctype html>${stringify(indexView(state))}`
      )

      await spawn`rollup -c rollup.config.js`
    }
  } catch (error) {
    console.error(error)

    process.exit(1)
  }
}

program()
