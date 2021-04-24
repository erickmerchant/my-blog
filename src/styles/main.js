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
    border: 3px solid var(--b);
    border-radius: var(--r);

    ${_atrules.colorSchemeLight} {
      --bg: hsl(90 10% 47.5%);
      --b: var(--bg);
      --c: hsl(0 0% 100%);
    }

    ${_atrules.colorSchemeDark} {
      --bg: hsl(100 10% 70% / 0.2);
      --b: currentColor;
      --c: hsl(100 10% 70%);
    }

    ${_atrules.veryMobile} {
      --r: 0.125rem;
    }

    ${_atrules.tabletUp} {
      --r: 1.5rem / 50%;
    }
  }

  .enabled {
    &:focus-within,
    &:hover {
      background-color: var(--hover-bg);

      --b: var(--hover-b);
    }

    ${_atrules.colorSchemeLight} {
      --hover-bg: hsl(90 30% 47.5%);
      --hover-b: var(--hover-bg);
      --bg: hsl(90 25% 47.5%);
    }

    ${_atrules.colorSchemeDark} {
      --hover-bg: hsl(100 80% 70% / 0.3);
      --hover-b: currentColor;
      --bg: hsl(100 80% 70% / 0.2);
      --b: currentColor;
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
    max-width: 100vw;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        padding-top: 0;
      }
    }
  }

  .header,
  .pagination,
  .message {
    ${mixins.mainItem}
  }

  .message {
    margin-top: 1em;
    margin-bottom: 1em;
    word-break: break-word;
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

    &::after {
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
