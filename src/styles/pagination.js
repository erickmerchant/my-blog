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

  .item,
  .itemEnabled {
    flex: 1 1 auto;
    min-width: 7rem;
    font-weight: ${fontWeights.heading2};
    color: hsl(var(--c));
    position: relative;
    padding-block: 1em;
    background-color: hsl(var(--bg) / var(--alpha));
    border: 3px solid currentColor;
    border-radius: var(--r);

    @media ${mq.justMobile} {
      &:last-child {
        --r: 0.125rem 1.5rem 1.5rem 0.125rem / 0.125rem 50% 50% 0.125rem;
      }

      &:first-child {
        --r: 1.5rem 0.125rem 0.125rem 1.5rem / 50% 0.125rem 0.125rem 50%;
      }
    }

    --bg: var(--h) 10% 70%;
    --c: var(--c2);
    --alpha: 0.2;

    @media ${mq.veryMobile} {
      --r: 0.125rem;
    }

    @media ${mq.tabletUp} {
      --r: 1.5rem / 50%;
    }
  }

  .itemEnabled {
    --c: var(--a-c);
    --bg: var(--h) 80% 70%;

    &:focus-within,
    &:hover {
      --alpha: 0.35;
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
