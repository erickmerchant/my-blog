import {terser} from 'rollup-plugin-terser'

export default {
  input: 'dist/app.js',
  output: {
    file: 'dist/app.js',
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
      resolveId(file) {
        if (file.startsWith('/')) return `dist${file}`
      }
    }
  ]
}
