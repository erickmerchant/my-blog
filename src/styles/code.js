import {css} from '@erickmerchant/css'

import {mq} from './core.js'

export const codeClasses = css`
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

  .block {
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

  .blockLine {
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

    &.comment {
      color: var(--c2);
    }
  }

  .blockCode {
    padding-top: var(--pt, 0);
    padding-bottom: var(--pb, 0);
  }

  .inline {
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
`
