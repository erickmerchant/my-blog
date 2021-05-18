import {css} from '@erickmerchant/css'

import {fontWeights, mixins, mq} from './core.js'

export const mainClasses = css`
  .heading1 {
    ${mixins.heading}

    font-weight: ${fontWeights.heading1};
    font-size: 1.5rem;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      margin-top: 2em;
    }
  }

  .main {
    opacity: 1;
    max-width: 100vw;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      padding-top: 0;
    }
  }

  .header {
    ${mixins.mainItem}
  }
`
