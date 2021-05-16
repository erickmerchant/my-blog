import {css} from '@erickmerchant/css'

import {fontWeights, mixins, mq} from './core.js'

export const contentClasses = css`
  .heading2,
  .list,
  .paragraph {
    ${mixins.mainItem}
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

  .pre {
    display: grid;

    @media ${mq.colorSchemeLight} {
      --c: hsl(90 55% 30%);
      --c2: hsl(90 5% 35%);
      --b: hsl(90 5% 35% / 0.0625);
    }

    @media ${mq.colorSchemeDark} {
      --c: hsl(100 45% 70%);
      --c2: hsl(100 5% 75%);
      --b: hsl(100 5% 75% / 0.0625);
    }

    @media ${mq.tabletUp} {
      max-width: 38rem;
      margin-inline: auto;
    }

    @media ${mq.desktopUp} and ${mq.tallUp} {
      max-width: 100%;
      margin-inline: 1rem;
    }
  }

  .codeBlock {
    font-family: 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace;
    font-weight: normal;
    font-size: 0.875rem;
    color: var(--c);
    overflow: auto;
    white-space: var(--code-white-space, pre-wrap);
    word-break: break-word;
    padding-block: 0;
    padding-inline: 1rem;
    background-color: var(--bg2);
    counter-reset: code;
    display: grid;
    grid-template-columns: max-content auto;

    @media ${mq.tabletUp} {
      border-radius: 0.25rem;
    }

    @media ${mq.veryMobile} {
      padding-inline: 0.5rem;
    }
  }

  .codeBlockLine {
    display: contents;

    &:first-child {
      --pt: 1em;
    }

    &:last-child {
      --pb: 1em;
    }

    &::before {
      counter-increment: code;
      content: counter(code);
      padding-right: 1rem;
      white-space: nowrap;
      color: var(--c2);
      text-align: right;
      border-right: 1px solid var(--b);
      margin-right: 1rem;
      padding-top: var(--pt, 0);
      padding-bottom: var(--pb, 0);

      @media ${mq.veryMobile} {
        padding-right: 0.5rem;
      }
    }
  }

  .codeBlockCode {
    padding-top: var(--pt, 0);
    padding-bottom: var(--pb, 0);
  }

  .codeBlockComment {
    color: var(--c2);
  }

  .codeInline {
    font-family: 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace;
    font-weight: normal;
    font-size: 0.875rem;
    color: var(--c);
    display: inline-block;
    border-radius: 0.25rem;
    padding-inline: 0.125rem;
    word-break: break-word;
    background-color: var(--bg2);

    @media ${mq.colorSchemeLight} {
      --c: inherit;
    }

    @media ${mq.colorSchemeDark} {
      --c: hsl(100 45% 70%);
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
      clip-path: polygon(
        50% 0%,
        60% 40%,
        100% 50%,
        60% 60%,
        50% 100%,
        40% 60%,
        0% 50%,
        40% 40%
      );
      margin-right: 0.5rem;
      height: 0.75em;
      width: 0.75rem;

      @media ${mq.colorSchemeLight} {
        background: var(--a-c);
      }

      @media ${mq.colorSchemeDark} {
        background: hsl(100 60% 70%);
      }
    }
  }

  .paragraph {
    margin-block: 1em;
    word-break: break-word;
  }
`
