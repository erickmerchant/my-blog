import {css} from '@erickmerchant/css'

import {mixins} from './core.js'
import {mainClasses} from './main.js'

export const errorClasses = css`
  .heading1 {
    ${mainClasses.heading1}
  }

  .main {
    ${mainClasses.main}
  }

  .header,
  .message {
    ${mixins.mainItem}
  }

  .message {
    margin-block: 1em;
    word-break: break-word;
  }
`
