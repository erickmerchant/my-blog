#!/usr/bin/env node
import {promisify} from 'util'
import fs from 'fs'
import execa from 'execa'
import {stringify} from '@erickmerchant/framework/stringify.js'
import {html} from '@erickmerchant/framework/main.js'
import {indexComponent} from './src/index.js'
import {createComponent} from './src/component.js'
import {contentComponent} from './src/common.js'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const options = {stdio: 'inherit', preferLocal: true}
const command = process.argv[2]

const program = async () => {
  try {
    if (command === 'start') {
      execa('css', ['src/styles.js', 'src/css/styles', '-wd'], options)

      execa(
        'css',
        ['src/editor/styles.js', 'src/editor/css/styles', '-wd'],
        options
      )

      execa('dev', ['serve', 'src', '-de', 'dev.html'], options)
    }

    if (command === 'build') {
      await Promise.all([
        execa('css', ['src/styles.js', 'src/css/styles'], options),
        execa(
          'dev',
          [
            'cache',
            'src',
            'dist',
            '-i',
            'src/editor',
            '-i',
            'src/editor.html',
            '-i',
            'src/dev.html'
          ],
          options
        )
      ])

      const {classes} = await import('./src/css/styles.js')

      const paths = {
        index: './dist/index.html',
        styles: './dist/css/styles.css'
      }

      const state = {route: '', title: ''}
      const mainComponent = createComponent({
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
        `<!doctype html>${stringify(indexComponent(state, {mainComponent}))}`
      )

      await execa('rollup', ['-c', 'rollup.config.js'], options)
    }
  } catch (error) {
    console.error(error)

    process.exit(1)
  }
}

program()
