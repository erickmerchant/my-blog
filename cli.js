#!/usr/bin/env node
import {promisify} from 'util'
import fs from 'fs'
import {stringify} from '@erickmerchant/framework/stringify.js'
import {html} from '@erickmerchant/framework/main.js'
import {indexComponent} from './src/components/index.js'
import {createLayoutComponent} from './src/components/layout.js'
import {contentComponent} from './src/common.js'
import childProcess from 'child_process'

const options = {stdio: 'inherit'}
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const command = process.argv[2]

const spawn = (strs, ...quoted) =>
  new Promise((resolve) => {
    const args = []

    for (let i = 0; i < strs.length; i++) {
      args.push(...strs[i].split(' '))

      if (quoted[i] != null) {
        args.push(quoted[i])
      }
    }

    const spawned = childProcess.spawn(args[0], args.slice(1), options)

    spawned.on('exit', () => {
      resolve()
    })
  })

const program = async () => {
  try {
    if (command === 'start') {
      spawn`css src/styles.js dist/css -wd`

      spawn`css src/editor/styles.js dist/editor/css -wd`

      spawn`dev serve src dist -de dev.html`
    }

    if (command === 'build') {
      await Promise.all([
        spawn`css src/styles.js dist/css`,
        spawn`dev cache src dist -i src/editor.html -i src/dev.html`
      ])

      const {classes} = await import('./dist/css/styles.js')

      const paths = {
        index: './dist/index.html',
        styles: './dist/css/styles.css'
      }

      const state = {route: '', title: ''}
      const mainComponent = createLayoutComponent({
        classes,
        contentComponent,
        mainComponent: () =>
          html`
            <article></article>
          `,
        anchorAttrs: (href) => {
          return {href}
        }
      })

      state.styles = await readFile(paths.styles, 'utf8')

      await writeFile(
        paths.index,
        `<!doctype html>${stringify(indexComponent({mainComponent})(state))}`
      )

      await spawn`rollup -c rollup.config.js`
    }
  } catch (error) {
    console.error(error)

    process.exit(1)
  }
}

program()
