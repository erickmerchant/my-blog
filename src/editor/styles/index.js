import {css} from '@erickmerchant/css'

export const _start = css`
  * {
    box-sizing: border-box;
    max-width: 100%;
    margin: 0;
    padding: 0;
    font: inherit;
  }

  html {
    color-scheme: light dark;
    font-family: Menlo, Monaco, 'Courier New', monospace;
    height: 100%;

    --black: hsl(100 10% 20%);
    --gray: hsl(100 10% 70%);
    --silver: hsl(100 10% 85%);
    --white: hsl(100 10% 100%);
    --green: hsl(100 30% 50%);
    --blue: hsl(200 100% 50%);
    --red: hsl(350 80% 55%);

    @media (prefers-color-scheme: dark) {
      --black: hsl(100 10% 100%);
      --gray: hsl(100 10% 60%);
      --silver: hsl(100 10% 55%);
      --white: hsl(100 10% 20%);
      --green: hsl(100 50% 60%);
      --blue: hsl(200 100% 60%);
      --red: hsl(350 80% 65%);
    }
  }
`

export {layoutClasses} from './layout.js'

export {listClasses} from './list.js'

export {formClasses} from './form.js'

export {highlightClasses} from './highlight.js'

export {errorClasses} from './error.js'
