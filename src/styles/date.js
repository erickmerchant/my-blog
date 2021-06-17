import {css} from '@erickmerchant/css'

import {fontWeights, mq} from './core.js'

export const dateClasses = css`
  .time {
    font-weight: ${fontWeights.bold};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    height: 1em;

    @media ${mq.colorSchemeLight} {
      --fg: currentColor;
    }

    @media ${mq.colorSchemeDark} {
      --fg: hsl(100 60% 70%);
    }
  }
`
