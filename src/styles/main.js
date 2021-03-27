import {css} from '@erickmerchant/css'

import {_atrules, fontWeights, mixins} from './core.js'

const paginationMixins = css`
  .disabled,
  .enabled {
    font-weight: ${fontWeights.heading2};
    color: var(--c);
    position: relative;
    padding-top: 1em;
    padding-bottom: 1em;
    background-color: var(--bg);
    border: 3px solid var(--b-c);
    border-radius: var(--r);

    --bg: hsl(90, 10%, 47.5%);
    --b-c: var(--bg);
    --c: #fff;

    ${_atrules.veryMobile} {
      --r: 0.125rem;
    }

    ${_atrules.tabletUp} {
      --r: 1.5rem / 50%;
    }

    ${_atrules.colorSchemeDark} {
      --bg: hsla(100, 10%, 70%, 0.2);
      --b-c: currentColor;
      --c: hsl(100, 10%, 70%);
    }
  }

  .enabled {
    --hover-bg: hsl(90, 30%, 47.5%);
    --hover-b-c: var(--hover-bg);
    --bg: hsl(90, 25%, 47.5%);

    :focus-within,
    :hover {
      background-color: var(--hover-bg);

      --b-c: var(--hover-b-c);
    }

    ${_atrules.colorSchemeDark} {
      --hover-bg: hsla(100, 80%, 70%, 0.3);
      --hover-b-c: currentColor;
      --bg: hsla(100, 80%, 70%, 0.2);
      --b-c: currentColor;
      --c: var(--a-c);
    }
  }

  .newer {
    --r: 0.125rem 1.5rem 1.5rem 0.125rem / 0.125rem 50% 50% 0.125rem;
  }

  .older {
    --r: 1.5rem 0.125rem 0.125rem 1.5rem / 50% 0.125rem 0.125rem 50%;
  }
`

export const mainClasses = css`
  .heading1 {
    ${mixins.heading}

    font-weight: ${fontWeights.heading1};
    font-size: 1.5rem;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        margin-top: 2em;
      }
    }
  }

  .main {
    opacity: 1;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        padding-top: 0;
      }
    }
  }

  .header,
  .heading2,
  .list,
  .paragraph,
  .pagination {
    max-width: 31rem;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    margin-right: auto;
    margin-left: auto;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        margin-right: 2rem;
        margin-left: 2rem;
      }
    }
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
    color: hsl(90, 10%, 70%);

    ${_atrules.colorSchemeDark} {
      color: hsl(100, 60%, 70%);
    }
  }

  .bold {
    font-weight: ${fontWeights.bold};
    color: var(--str-c, inherit);
  }

  .pre {
    display: block;
  }

  .codeBlock {
    font-family: 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace;
    font-weight: bolder;
    font-size: 0.875rem;
    color: var(--c);
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    background-color: var(--bg2);
    counter-reset: code;
    display: grid;
    grid-template-columns: max-content auto;

    --c: hsl(90, 55%, 30%);
    --c2: hsl(90, 5%, 35%);

    ${_atrules.tabletUp} {
      max-width: 38rem;
      margin-right: auto;
      margin-left: auto;
      padding-right: 1rem;
      padding-left: 1rem;
      border-radius: 0.125rem;
    }

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        max-width: 100%;
        margin-right: 1rem;
        margin-left: 1rem;
      }
    }

    ${_atrules.colorSchemeDark} {
      --c: hsl(100, 45%, 70%);
      --c2: hsl(100, 5%, 75%);
    }
  }

  .codeBlockLine {
    display: contents;

    ::before {
      counter-increment: code;
      content: counter(code);
      padding-right: 1em;
      white-space: nowrap;
      color: var(--c2);
    }
  }

  .codeBlockComment {
    color: var(--c2);
  }

  .codeInline {
    font-family: 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace;
    font-weight: bolder;
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
      --c: hsl(100, 45%, 70%);
    }
  }

  .anchor {
    font-weight: ${fontWeights.semibold};
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
        background: hsl(100, 60%, 70%);
      }
    }
  }

  .paragraph {
    margin-top: 1em;
    margin-bottom: 1em;
    word-break: break-word;
  }

  .date {
    font-weight: ${fontWeights.semibold};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .dateIcon {
    height: 1em;
    margin-right: 0.5rem;
  }

  .dateFG {
    fill: currentColor;

    ${_atrules.colorSchemeDark} {
      fill: hsl(100, 60%, 70%);
    }
  }

  .dateBG {
    fill: var(--bg);
  }

  .pagination {
    margin-top: 2em;
    padding-right: 1rem;
    padding-left: 1rem;

    ${_atrules.veryMobile} {
      padding-right: 0.5rem;
      padding-left: 0.5rem;
    }
  }

  .paginationList {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
    text-align: center;
    list-style: none;
    gap: 0.25rem;

    ${_atrules.tabletUp} {
      gap: 3vw;
    }
  }

  .paginationItemDisabledNewer {
    ${paginationMixins.disabled}
    ${paginationMixins.newer}
  }

  .paginationItemEnabledNewer {
    ${paginationMixins.enabled}
    ${paginationMixins.newer}
  }

  .paginationItemDisabledOlder {
    ${paginationMixins.disabled}
    ${paginationMixins.older}
  }

  .paginationItemEnabledOlder {
    ${paginationMixins.enabled}
    ${paginationMixins.older}
  }

  .paginationAnchor {
    color: inherit;
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;
    -webkit-tap-highlight-color: transparent;

    ::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      border-radius: var(--r);
    }
  }
`
