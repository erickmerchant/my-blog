import {css} from '@erickmerchant/css'

import {fontWeights, mixins, mq} from './core.js'

export const layoutClasses = css`
  .app {
    display: grid;
    min-height: 100%;
    grid-template-rows: max-content 1fr max-content max-content;
    color: hsl(var(--c));
    background-color: hsl(var(--bg));

    --hdr-bg-partial: hsl(var(--hdr-bg-ln-c)) 1px, transparent 1px;
    --hdr-bg-i: linear-gradient(0deg, var(--hdr-bg-partial)),
      linear-gradient(90deg, var(--hdr-bg-partial));

    @media ${mq.colorSchemeLight} {
      --h: 80;
      --c: var(--h) 10% 20%;
      --c2: var(--h) 5% 35%;
      --bg: 0 0% 100%;
      --bg2: var(--h) 35% 95%;
      --a-c: var(--h) 35% 35%;
      --hdr-bg-ln-c: var(--a-c) / 0.15;
      --hdr-bg: var(--h) 95% 95%;
    }

    @media ${mq.colorSchemeDark} {
      --h: 100;
      --c: 0 0% 100%;
      --c2: var(--h) 5% 70%;
      --bg: var(--h) 10% 15%;
      --bg2: var(--h) 10% 17.5%;
      --a-c: var(--h) 80% 70%;
      --hdr-bg-ln-c: var(--c) / 0.075;
      --hdr-bg: var(--h) 25% 17.5%;
    }

    @media ${mq.desktopUp} and ${mq.tallUp} {
      grid-template-columns: 1fr 2fr;
    }
  }

  .header {
    font-weight: ${fontWeights.heading2};
    padding-block: 1em;
    display: flex;
    justify-content: center;
    background-color: hsl(var(--hdr-bg) / 0.9);
    background-image: var(--hdr-bg-i);
    background-size: 1rem 1rem;
    background-position: 50% 0;
    border-bottom: 2px solid hsl(var(--a-c));
    grid-row: 1;
    grid-column: 1;

    @media ${mq.tallUp} {
      position: sticky;
      top: 0;
      z-index: 1;
    }

    @media ${mq.desktopUp} and ${mq.tallUp} {
      font-weight: ${fontWeights.heading1};
      font-size: 1.5rem;
      background-image: none;
      background-color: transparent;
      border-left: none;
      border-bottom: none;
      padding: 0 0.5rem;
      max-width: max-content;
      grid-row: 1 / -1;
      height: 100vh;
      display: grid;
      grid-auto-rows: 1fr;
      grid-template-columns: 90%;
      align-items: start;
    }
  }

  .headerAnchor {
    color: hsl(var(--a-c));
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;

    &::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
    }

    @media ${mq.desktopUp} and ${mq.tallUp} {
      ${mixins.heading}

      margin-top: 2em;

      &::after {
        display: none;
      }
    }
  }

  .aside {
    display: contents;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      color: hsl(var(--c));
      grid-row: 1 / -1;
      grid-column: 1;
      position: sticky;
      top: 0;
      height: 100vh;
      display: grid;
      justify-content: center;
      grid-auto-rows: 1fr;
      grid-template-columns: 90%;
      background-color: hsl(var(--hdr-bg) / 0.9);
      background-image: var(--hdr-bg-i);
      background-size: 1rem 1rem;
      background-position: 50% 0;
      border-right: 4px solid hsl(var(--a-c));
    }
  }

  .footer {
    display: var(--below-main-display, none);
    padding-inline: 0.5rem;
    padding-bottom: 0.25em;
    width: 100%;
    background-color: hsl(var(--bg2));
    border-top: 1px solid hsl(var(--c) / 0.25);

    @media ${mq.desktopUp} and ${mq.tallUp} {
      grid-row: 3;
      grid-column: 2;
      padding-top: 1em;
      padding-inline: 0;
      margin-top: 2em;
      margin-inline: auto;
      border-top: none;
      background-color: hsl(var(--bg2));
    }
  }

  .footerList {
    font-size: 0.875rem;
    list-style: none;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    padding-top: 1.5em;
    padding-bottom: 1em;
    position: relative;

    @media ${mq.desktopUp} and ${mq.tallUp} {
      max-width: 35rem;
      padding-top: 0.5em;
    }
  }

  .footerItem {
    white-space: nowrap;
  }

  .footerAnchor {
    color: hsl(var(--a-c));
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
  }
`
