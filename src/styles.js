import {css} from '@erickmerchant/css'

import {_atrules, fontWeights} from './styles/core.js'

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

export {_atrules}

export {layoutClasses} from './styles/layout.js'

export {aboutClasses} from './styles/about.js'

export {mainClasses} from './styles/main.js'

export {contentClasses} from './styles/content.js'

export {dateClasses} from './styles/date.js'
