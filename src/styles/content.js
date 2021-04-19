import {css} from '@erickmerchant/css'

import {_atrules, fontWeights, mixins} from './core.js'

export const contentClasses = css`
  .heading2,
  .list,
  .paragraph {
    ${mixins.mainItem}
  }

  .heading2 {
    ${mixins.heading}

    font-weight: ${fontWeights.heading2};

    :hover {
      --a-display: inline;
    }
  }

  .heading2Anchor {
    text-decoration: none;
    margin-left: 0.5rem;
    display: var(--a-display, none);
    color: hsl(90 10% 70%);

    ${_atrules.colorSchemeDark} {
      color: hsl(100 60% 70%);
    }
  }

  .pre {
    display: grid;

    --c: hsl(90 55% 30%);
    --c2: hsl(90 5% 35%);
    --b: hsl(90 5% 35% / 0.0625);

    ${_atrules.colorSchemeDark} {
      --c: hsl(100 45% 70%);
      --c2: hsl(100 5% 75%);
      --b: hsl(100 5% 75% / 0.0625);
    }

    ${_atrules.tabletUp} {
      max-width: 38rem;
      margin-right: auto;
      margin-left: auto;
    }

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        max-width: 100%;
        margin-right: 1rem;
        margin-left: 1rem;
      }
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
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    background-color: var(--bg2);
    counter-reset: code;
    display: grid;
    grid-template-columns: max-content auto;

    ${_atrules.tabletUp} {
      padding-right: 1rem;
      padding-left: 1rem;
      border-radius: 0.125rem;
    }
  }

  .codeBlockLine {
    display: contents;

    ::before {
      counter-increment: code;
      content: counter(code);
      padding-right: 1rem;
      white-space: nowrap;
      color: var(--c2);
      text-align: right;
      border-right: 1px solid var(--b);
      margin-right: 1rem;
    }
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
    border-radius: 0.125rem;
    padding-right: 0.125rem;
    padding-left: 0.125rem;
    word-break: break-word;
    background-color: var(--bg2);

    --c: inherit;

    ${_atrules.colorSchemeDark} {
      --c: hsl(100 45% 70%);
    }
  }

  .anchor {
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
  }

  .list {
    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 0.5rem;
    list-style: none;
  }

  .listItem {
    margin-bottom: 0.25em;
    display: grid;
    grid-template-columns: max-content auto;

    ::before {
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
      background: currentColor;
      margin-right: 0.5rem;
      height: 0.75em;
      width: 0.75em;

      ${_atrules.colorSchemeDark} {
        background: hsl(100 60% 70%);
      }
    }
  }

  .paragraph {
    margin-top: 1em;
    margin-bottom: 1em;
    word-break: break-word;
  }
`
