import {css} from '@erickmerchant/css'

import {fontWeights} from './core.js'

export const _start = css`
  @font-face {
    font-display: swap;
    font-family: 'Public Sans';
    font-style: normal;
    font-weight: 100 900;
    src: url('/fonts/public-sans/public-sans-subset.woff2') format('woff2');
  }

  * {
    box-sizing: border-box;
    max-width: 100%;
    margin: 0;
    padding: 0;
    font: inherit;
  }

  html {
    font-weight: ${fontWeights.normal};
    font-family: 'Public Sans', system-ui, sans-serif;
    font-size: max(20px, 1vw);
    -webkit-text-size-adjust: none;
    line-height: 1.5;
    height: 100%;
    scroll-padding-top: 12vh;
  }
`

export {layoutClasses} from './layout.js'

export {aboutClasses} from './about.js'

export {mainClasses} from './main.js'

export {postClasses} from './post.js'

export {codeClasses} from './code.js'

export {paginationClasses} from './pagination.js'

export {errorClasses} from './error.js'

export {dateClasses} from './date.js'
