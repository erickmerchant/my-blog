import {css} from '@erickmerchant/css';

import {fontWeights, mixins, mq} from './core.js';

export const aboutClasses = css`
  .about {
    display: var(--below-main-display, none);
    grid-row: 3;
    margin-top: 2em;
    padding-inline: 0.5rem;
    padding-bottom: 1.5em;
    background-color: hsl(var(--bg2));

    @media ${mq.desktopUp} and ${mq.tallUp} {
      display: block;
      color: inherit;
      grid-column: 1;
      background-color: transparent;
      padding-bottom: 2em;
    }
  }

  .heading {
    ${mixins.heading}

    font-weight: ${fontWeights.bold};
    padding-top: 0.5em;
    width: 100%;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      width: 15rem;
    }
  }

  .anchor {
    color: hsl(var(--a-c));
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
    display: inline-block;
  }

  .paragraph {
    font-size: 0.875rem;
    width: 100%;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      width: 15rem;
    }
  }
`;
