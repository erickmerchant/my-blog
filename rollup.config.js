import {terser} from 'rollup-plugin-terser'

export default {
  input: 'dist/app.js',
  output: {
    file: 'dist/app.js',
    format: 'esm',
    plugins: [
      terser({
        compress: {
          passes: 10
        },
        mangle: {
          toplevel: true,
          properties: {
            reserved: [
              'title',
              'slug',
              'date',
              'year',
              'month',
              'day',
              'Accept',
              'Content-Type',
              'headers',
              'post'
            ]
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
