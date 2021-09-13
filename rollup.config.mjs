import got from 'got'
import path from 'path'
import {terser} from 'rollup-plugin-terser'

export default {
  input: 'app.js',
  output: {
    dir: 'dist',
    format: 'esm',
    plugins: [
      terser({
        toplevel: true,
        compress: {
          passes: 10
        },
        mangle: true,
        ecma: 11
      })
    ]
  },
  plugins: [
    {
      async load(id) {
        const response = await got(`https://localhost:3000/${id}`, {
          https: {
            rejectUnauthorized: false
          }
        })

        return response.body
      },

      resolveId(source) {
        if (source.startsWith('/')) {
          source = path.resolve(`.${source}`)
        }

        return path.relative(process.cwd(), source)
      }
    }
  ]
}
