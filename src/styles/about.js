import {css} from '@erickmerchant/css'

import {fontWeights, mixins, mq} from './core.js'

export const aboutClasses = css`
  .about {
    display: var(--below-main-display, none);
    color: var(--ftr-c);
    grid-row: 3;
    margin-top: 2em;
    padding-inline: 0.5rem;
    padding-bottom: 1em;
    background-repeat: repeat-x;
    background-position: left top;
    background-color: var(--bg2);
    background-image: var(--zz-bg);
    background-size: 1rem 1rem;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      display: block;
      color: inherit;
      grid-column: 1;
      background-image: none;
      background-color: transparent;
      padding-bottom: 2em;
      padding-inline: 0;
      max-width: 20rem;
    }
  }

  .heading {
    ${mixins.heading}

    font-weight: ${fontWeights.bold};
    padding-top: 1em;
    max-width: 30rem;
    margin-inline: auto;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      max-width: 100%;
    }
  }

  .anchor {
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      color: var(--hdr-a-c);
    }
  }

  .paragraph {
    font-size: 0.875rem;
    max-width: 30rem;
    margin-inline: auto;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      max-width: 100%;
    }
  }
`
