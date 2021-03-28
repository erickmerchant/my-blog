import {css} from '@erickmerchant/css'

import {fontWeights} from './core.js'

export const errorClasses = css`
  .container {
    padding: 1em;
    height: 100%;
  }

  .heading {
    font-weight: ${fontWeights.heading};
    font-size: 1.5em;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }

  .stack {
    color: var(--red);
    white-space: pre-wrap;
    word-break: break-word;
  }
`
