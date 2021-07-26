import {css} from '@erickmerchant/css'

import {fontWeights} from './core.js'

export const _start = css`
  @font-face {
    font-display: swap;
    font-family: 'Public Sans';
    font-style: normal;
    font-weight: 100 900;
    src: url('/assets/fonts/public-sans/public-sans-subset.woff2')
      format('woff2');
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
    font-family: 'Public Sans', system-ui, -apple-system, sans-serif;
    font-size: max(20px, 1vw);
    -webkit-text-size-adjust: none;
    line-height: 1.5;
    height: 100%;
    scroll-padding-top: 14vh;
  }
`

export {layoutClasses} from './layout.js'

export {aboutClasses} from './about.js'

export {preferencesClasses} from './preferences.js'

export {mainClasses} from './main.js'

export {contentClasses} from './content.js'

export {codeClasses} from './code.js'

export {paginationClasses} from './pagination.js'

export {iconsClasses} from './icons.js'
