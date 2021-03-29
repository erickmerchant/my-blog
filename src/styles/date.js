import {css} from '@erickmerchant/css'

import {_atrules, fontWeights} from './core.js'

export const dateClasses = css`
  .time {
    font-weight: ${fontWeights.semibold};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .icon {
    height: 1em;
    margin-right: 0.5rem;
  }

  .foreground {
    fill: currentColor;

    ${_atrules.colorSchemeDark} {
      fill: hsl(100, 60%, 70%);
    }
  }

  .background {
    fill: var(--bg);
  }
`
