import {css} from '@erickmerchant/css';

import {fontWeights} from './core.js';

export const layoutClasses = css`
  .app {
    font-weight: ${fontWeights.normal};
    font-size: 16px;
    line-height: 1.5;
    color: var(--black);
    max-width: 100vw;
    overflow-x: scroll;
    height: 100%;
    background-color: var(--white);
  }
`;
