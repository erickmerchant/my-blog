import {css} from '@erickmerchant/css'

import {fontWeights, mq} from './core.js'

export const dateClasses = css`
  .time {
    font-weight: ${fontWeights.bold};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .icon {
    height: 1em;
    margin-right: 0.5rem;
  }

  .foreground {
    @media ${mq.colorSchemeLight} {
      fill: currentColor;
    }

    @media ${mq.colorSchemeDark} {
      fill: hsl(100 60% 70%);
    }
  }

  .background {
    fill: var(--bg);
  }
`
