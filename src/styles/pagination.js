import {css} from '@erickmerchant/css'

import {fontWeights, mixins, mq} from './core.js'

export const paginationClasses = css`
  .nav {
    ${mixins.mainItem}

    margin-top: 2em;
    padding-inline: 1rem;

    @media ${mq.veryMobile} {
      padding-inline: 0.5rem;
    }
  }

  .list {
    display: flex;
    justify-content: stretch;
    flex-wrap: wrap;
    text-align: center;
    list-style: none;
    gap: 0.25rem;

    @media ${mq.tabletUp} {
      gap: 3vw;
      justify-content: space-between;
    }
  }

  .item {
    flex: 1 1 auto;
    min-width: 7rem;
    font-weight: ${fontWeights.heading2};
    color: var(--c);
    position: relative;
    padding-block: 1em;
    background-color: var(--bg);
    border: 3px solid var(--b);

    &:last-child {
      border-radius: var(
        --r,
        0.125rem 1.5rem 1.5rem 0.125rem / 0.125rem 50% 50% 0.125rem
      );
    }

    &:first-child {
      border-radius: var(
        --r,
        1.5rem 0.125rem 0.125rem 1.5rem / 50% 0.125rem 0.125rem 50%
      );
    }

    &.enabled {
      @media ${mq.colorSchemeLight} {
        --hover-bg: hsl(90 30% 47.5%);
        --hover-b: var(--hover-bg);
        --bg: hsl(90 25% 47.5%);
      }

      @media ${mq.colorSchemeDark} {
        --hover-bg: hsl(100 80% 70% / 0.3);
        --hover-b: currentColor;
        --bg: hsl(100 80% 70% / 0.2);
        --b: currentColor;
        --c: var(--a-c);
      }
    }

    &.enabled:focus-within,
    &.enabled:hover {
      background-color: var(--hover-bg);

      --b: var(--hover-b);
    }

    @media ${mq.colorSchemeLight} {
      --bg: hsl(90 10% 47.5%);
      --b: var(--bg);
      --c: hsl(0 0% 100%);
    }

    @media ${mq.colorSchemeDark} {
      --bg: hsl(100 10% 70% / 0.2);
      --b: currentColor;
      --c: hsl(100 10% 70%);
    }

    @media ${mq.veryMobile} {
      --r: 0.125rem;
    }

    @media ${mq.tabletUp} {
      --r: 1.5rem / 50%;
    }
  }

  .anchor {
    color: inherit;
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;
    -webkit-tap-highlight-color: transparent;
    background: transparent;

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
