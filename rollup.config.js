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
          toplevel: true
        },
        ecma: 11
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
