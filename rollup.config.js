import {terser} from 'rollup-plugin-terser'

export default {
  input: 'dist/app.mjs',
  output: {
    file: 'dist/app.mjs',
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
