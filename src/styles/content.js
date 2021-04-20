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

    ${_atrules.colorSchemeLight} {
      color: hsl(90 10% 70%);
    }

    ${_atrules.colorSchemeDark} {
      color: hsl(100 60% 70%);
    }
  }

  .pre {
    display: grid;

    ${_atrules.colorSchemeLight} {
      --c: hsl(90 55% 30%);
      --c2: hsl(90 5% 35%);
      --b: hsl(90 5% 35% / 0.0625);
    }

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
      border-radius: 0.125rem 0.125rem 0 0.125rem;
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

  .codeToggleWrapLabel {
    display: flex;
    align-items: center;
    justify-self: end;
    background: var(--bg2);
    font-size: 0.75rem;
    padding: 0.5em 1rem;
    border-radius: 0 0 0.25rem 0.25rem;
    position: relative;

    ::after {
      content: '';
      height: 0.5rem;
      width: 0.5rem;
      position: absolute;
      top: 0;
      left: -0.5rem;
      clip-path: circle(100% at 0 100%);
      background: var(--bg);
    }

    ::before {
      content: '';
      height: 0.5rem;
      width: 0.5rem;
      position: absolute;
      top: 0;
      left: -0.5rem;
      background: var(--bg2);
    }
  }

  .codeToggleWrapCheckbox {
    height: 1em;
    width: 1em;
    margin: 0.25em;
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

    ${_atrules.colorSchemeLight} {
      --c: inherit;
    }

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
      margin-right: 0.5rem;
      height: 0.75em;
      width: 0.75em;

      ${_atrules.colorSchemeLight} {
        background: currentColor;
      }

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
