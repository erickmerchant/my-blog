import {css} from '@erickmerchant/css'

import {fontWeights, mixins, mq} from './core.js'

export const mainClasses = css`
  .main {
    opacity: 1;
    max-width: 100vw;
  }

  .header {
    ${mixins.mainItem}
  }

  .heading1 {
    ${mixins.heading}

    font-weight: ${fontWeights.heading1};
    font-size: 1.5rem;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      margin-top: 2em;
    }
  }

  .date {
    font-weight: ${fontWeights.bold};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .dateIcon {
    height: 1em;
    width: 1em;
    color: var(--icon-c);
  }
`
