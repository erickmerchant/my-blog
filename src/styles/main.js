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

    position: relative;
    font-weight: ${fontWeights.heading2};
    --fg: currentColor;

    @media ${mq.tabletUp} {
      --fg: var(--bg);

      &:hover {
        --fg: currentColor;
      }
    }
  }

  .heading2Anchor {
    text-decoration: none;
    overflow: visible;
    margin-right: 0.5rem;
    height: 0.875rem;
    width: 0.875rem;

    @media ${mq.tabletUp} {
      position: absolute;
      left: -0.75rem;
      margin-right: 1rem;
    }

    @media ${mq.colorSchemeLight} {
      color: var(--a-c);
    }

    @media ${mq.colorSchemeDark} {
      color: hsl(100 60% 70%);
    }
  }

  .heading2Icon {
    display: inline-block;
    height: 0.875rem;
    width: 0.875rem;
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
    display: inline-grid;
    grid-template-columns: max-content auto 1fr;
    width: 100%;

    &::before {
      align-self: top;
      content: '';
      border-radius: 100%;
      border: 3px solid var(--a-c);
      margin-right: 0.5rem;
      margin-top: 0.5rem;
      height: 0.275em;
      width: 0.275rem;
      background: transparent;
    }
  }

  .paragraph {
    margin-block: 1em;
    word-break: break-word;
  }
`
