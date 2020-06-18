import {terser} from 'rollup-plugin-terser'

export default {
  input: 'dist/app.js',
  output: {
    file: 'dist/app.js',
    format: 'esm'
  },
  plugins: [
    {
      resolveId(file) {
        if (file.startsWith('/')) return `dist${file}`
      }
    },
    terser()
  ]
}
