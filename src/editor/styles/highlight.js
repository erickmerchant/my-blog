import {css} from '@erickmerchant/css'

import {fontWeights} from './core.js'

export const highlightClasses = css`
  .punctuation {
    font-weight: ${fontWeights.normal};
    color: var(--gray);
  }

  .bold {
    font-weight: ${fontWeights.bold};
  }

  .url {
    color: var(--blue);
  }

  .codeBlock {
    font-weight: ${fontWeights.normal};
    color: var(--green);
    white-space: pre-wrap;
  }

  .codeInline {
    font-weight: ${fontWeights.normal};
    color: var(--green);
  }

  .heading {
    font-weight: ${fontWeights.heading};
    color: var(--black);
  }

  .headingPunctuation {
    font-weight: ${fontWeights.heading};
    color: var(--gray);
  }
`
