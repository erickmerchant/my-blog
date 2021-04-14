import {css} from '@erickmerchant/css'

import {_atrules, fontWeights, mixins} from './core.js'

export const aboutClasses = css`
  .about {
    display: var(--below-main-display, none);
    color: var(--ftr-c);
    grid-row: 3;
    margin-top: 2em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 1em;
    background-repeat: repeat-x;
    background-position: left top;
    background-color: var(--bg2);
    background-image: var(--zz-bg);
    background-size: 1rem 1rem;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        display: block;
        color: inherit;
        grid-column: 1;
        background-image: none;
        background-color: transparent;
        padding-bottom: 2em;
        padding-left: 0;
        padding-right: 0;
        max-width: 20rem;
      }
    }
  }

  .heading {
    ${mixins.heading}

    font-weight: ${fontWeights.bold};
    padding-top: 1em;
    max-width: 30rem;
    margin-right: auto;
    margin-left: auto;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        max-width: 100%;
      }
    }
  }

  .anchor {
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        color: var(--hdr-a-c);
      }
    }
  }

  .paragraph {
    font-size: 0.875rem;
    max-width: 30rem;
    margin-right: auto;
    margin-left: auto;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        max-width: 100%;
      }
    }
  }
`
