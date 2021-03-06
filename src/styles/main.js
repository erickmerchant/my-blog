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

  .date {
    font-weight: ${fontWeights.bold};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .dateIcon {
    height: 1em;
    width: 1em;

    @media ${mq.colorSchemeDark} {
      color: hsl(var(--a-c));
    }
  }

  .heading2 {
    ${mixins.heading}

    position: relative;
    font-weight: ${fontWeights.heading2};

    @media ${mq.tabletUp} {
      &:not(:hover, :focus-within) {
        --i-c: transparent;
      }
    }
  }

  .heading2Anchor {
    text-decoration: none;
    overflow: visible;
    margin-right: 0.5rem;
    height: 1em;
    width: 1em;
    color: var(--i-c, hsl(var(--a-c)));

    @media ${mq.tabletUp} {
      position: absolute;
      left: -0.75rem;
      margin-right: 0;
    }
  }

  .heading2Icon {
    display: inline-block;
    height: 1em;
    width: 1em;
  }

  .anchor {
    color: hsl(var(--a-c));
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
      margin-right: 0.5rem;
      margin-top: 0.5rem;
      height: 0.25em;
      width: 0.25rem;
      background: transparent;
      border: 2px solid currentColor;

      @media ${mq.colorSchemeDark} {
        color: hsl(var(--a-c));
      }
    }
  }

  .paragraph {
    margin-block: 1em;
    word-break: break-word;
  }
`
