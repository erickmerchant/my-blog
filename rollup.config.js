import {terser} from 'rollup-plugin-terser'

export default {
  input: 'dist/app.js',
  output: {
    file: 'dist/app.js',
    format: 'esm',
    plugins: [
      terser({
        mangle: {
          toplevel: true,
          properties: {
            reserved: ['title', 'slug', 'date', 'year', 'month', 'day']
          }
        },
        ecma: 10,
        safari10: true
      })
    ]
  },
  plugins: [
    {
      resolveId(file) {
        if (file.startsWith('/')) return `dist${file}`
      }
    }
  ]
}
