import {css} from '@erickmerchant/css'

import {mq} from './core.js'

export const codeClasses = css`
  .pre {
    display: contents;
  }

  .block {
    font-family: 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace;
    font-weight: normal;
    font-size: 0.875rem;
    overflow: auto;
    white-space: var(--code-white-space, pre-wrap);
    word-break: break-word;
    padding-inline: 1rem;
    background-color: hsl(var(--bg2));
    counter-reset: code;
    display: grid;
    grid-template-columns: max-content auto;

    @media ${mq.colorSchemeLight} {
      color: hsl(var(--h) 45% 30%);
    }

    @media ${mq.colorSchemeDark} {
      color: hsl(var(--h) 45% 70%);
    }

    @media ${mq.tabletUp} {
      border-radius: 0.25rem;
      max-width: 38rem;
      margin-inline: auto;
    }

    @media ${mq.desktopUp} and ${mq.tallUp} {
      max-width: 100%;
      margin-inline: 1rem;
    }

    @media ${mq.veryMobile} {
      padding-inline: 0.5rem;
    }
  }

  .codeLine,
  .commentLine {
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
      color: hsl(var(--c2));
      text-align: right;
      border-right: 1px solid hsl(var(--c) / 0.25);
      margin-right: 1rem;
      padding-top: var(--pt, 0);
      padding-bottom: var(--pb, 0);

      @media ${mq.veryMobile} {
        padding-right: 0.5rem;
      }
    }
  }

  .commentLine {
    color: hsl(var(--c2));
  }

  .blockCode {
    padding-top: var(--pt, 0);
    padding-bottom: var(--pb, 0);
  }

  .inline {
    font-family: 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace;
    font-weight: normal;
    font-size: 0.875rem;
    display: inline-block;
    border-radius: 0.25rem;
    padding-inline: 0.125rem;
    word-break: break-word;
    background-color: hsl(var(--bg2));

    @media ${mq.colorSchemeDark} {
      color: hsl(var(--h) 45% 70%);
    }
  }
`
