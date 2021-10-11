import {css} from 'dedupe.css';

import {fontWeights, mixins, mq} from './core.js';

export const contentClasses = css`
  .heading2,
  .list,
  .paragraph {
    ${mixins.mainItem}
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
  }

  .listItem {
    margin-bottom: 0.25em;
    width: 100%;
    margin-left: 0.6em;
    padding-left: 0.5em;
    list-style-position: outside;

    &::marker {
      content: '⚬';
      font-weight: bold;
      color: hsl(var(--a-c));
    }
  }

  .paragraph {
    margin-block: 1em;
    word-break: break-word;
  }
`;
