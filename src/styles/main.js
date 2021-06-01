import {css} from '@erickmerchant/css'

import {fontWeights, mixins, mq} from './core.js'

export const mainClasses = css`
  .main {
    opacity: 1;
    max-width: 100vw;
  }

  .header,
  .heading2,
  .list,
  .paragraph {
    ${mixins.mainItem}
  }

  .heading1 {
    ${mixins.heading}

    font-weight: ${fontWeights.heading1};
    font-size: 1.5rem;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      margin-top: 2em;
    }
  }

  .heading2 {
    ${mixins.heading}

    font-weight: ${fontWeights.heading2};

    @media ${mq.tabletUp} {
      &:hover {
        --a-display: inline-block;
      }
    }
  }

  .heading2Anchor {
    text-decoration: none;
    margin-right: 0.5rem;
    width: 0.75rem;

    @media ${mq.tabletUp} {
      display: var(--a-display, none);
      position: relative;
      left: -0.5rem;
      margin-left: -0.5rem;
      width: 0;
    }

    @media ${mq.colorSchemeLight} {
      color: var(--a-c);
    }

    @media ${mq.colorSchemeDark} {
      color: hsl(100 60% 70%);
    }
  }

  .anchor {
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
  }

  .list {
    margin-block: 1em;
    padding-left: 0.5rem;
    list-style: none;
  }

  .listItem {
    margin-bottom: 0.25em;
    display: grid;
    grid-template-columns: max-content auto;

    &::before {
      align-self: center;
      content: '';
      clip-path: circle(25%);
      margin-right: 0.25rem;
      height: 0.75em;
      width: 0.75rem;
      background: var(--a-c);
    }
  }

  .paragraph {
    margin-block: 1em;
    word-break: break-word;
  }
`
