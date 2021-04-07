import {css} from '@erickmerchant/css'

import {_atrules, fontWeights, mixins} from './core.js'

export const layoutClasses = css`
  .app {
    display: grid;
    min-height: 100%;
    grid-template-rows: max-content 1fr max-content max-content;
    color: var(--c);
    background-color: var(--bg);

    --zz-bg: linear-gradient(225deg, var(--bg) 0.5rem, transparent 0),
      linear-gradient(135deg, var(--bg) 0.5rem, var(--bg2) 0);

    --c: hsl(90 10% 20%);
    --bg: hsl(0 0% 100%);
    --bg2: hsl(90 25% 95%);
    --grid-c: hsl(0 0% 100% / 0.1);
    --a-c: hsl(90 35% 35%);
    --hdr-a-c: hsl(0 0% 100%);
    --hdr-c: hsl(0 0% 100%);
    --hdr-bg: hsl(90 35% 40% / 0.9);
    --hdr-bg-i: linear-gradient(0deg, var(--grid-c) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-c) 1px, transparent 1px);
    --hdr-bg-size: 2rem 2rem;
    --hdr-b: transparent;
    --ftr-c: var(--c);
    --ftr-hr-b-c: hsl(90 10% 90%);

    ${_atrules.colorSchemeDark} {
      --c: hsl(0 0% 100%);
      --bg: hsl(100 10% 15%);
      --bg2: hsl(100 10% 17.5%);
      --grid-c: hsl(0 0% 100% / 0.075);
      --a-c: hsl(100 80% 70%);
      --hdr-a-c: hsl(100 90% 85%);
      --hdr-c: hsl(0 0% 100%);
      --hdr-bg: hsl(100 25% 17.5% / 0.9);
      --hdr-bg-size: 1rem 1rem;
      --hdr-b: hsl(100 30% 70%);
      --ftr-c: hsl(0 0% 100%);
      --ftr-hr-b-c: hsl(100 10% 20%);
    }

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        grid-template-columns: 1fr 2fr;
      }
    }
  }

  .header {
    font-weight: ${fontWeights.heading2};
    padding-top: 1em;
    padding-bottom: 1em;
    display: flex;
    justify-content: center;
    background-color: var(--hdr-bg);
    background-image: var(--hdr-bg-i);
    background-size: var(--hdr-bg-size);
    background-position: 50% 0;
    border-bottom: 2px solid var(--hdr-b);
    grid-row: 1;
    grid-column: 1;

    ${_atrules.tallUp} {
      position: sticky;
      top: 0;
      z-index: 1;

      ${_atrules.desktopUp} {
        font-weight: ${fontWeights.heading1};
        font-size: 1.5rem;
        background-image: none;
        background-color: transparent;
        border-left: none;
        border-bottom: none;
        padding-top: 0;
        padding-bottom: 0;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
        max-width: max-content;
        grid-row: 1 / -1;
        height: 100vh;
        display: grid;
        grid-auto-rows: 1fr;
        grid-template-columns: 90%;
        align-items: start;
      }
    }
  }

  .headerAnchor {
    color: var(--hdr-a-c);
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;

    ::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
    }

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        ${mixins.heading}

        margin-top: 2em;

        ::after {
          display: none;
        }
      }
    }
  }

  .aside {
    display: contents;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        color: var(--hdr-c);
        grid-row: 1 / -1;
        grid-column: 1;
        position: sticky;
        top: 0;
        height: 100vh;
        display: grid;
        justify-content: center;
        grid-auto-rows: 1fr;
        grid-template-columns: 90%;
        background-color: var(--hdr-bg);
        background-image: var(--hdr-bg-i);
        background-size: var(--hdr-bg-size);
        border-right: 4px solid var(--hdr-b);
      }
    }
  }

  .footer {
    display: var(--below-main-display, none);
    color: var(--ftr-c);
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25em;
    width: 100%;
    background-color: var(--bg2);
    border-top: 1px solid var(--ftr-hr-b-c);

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        grid-row: 3;
        grid-column: 2;
        padding-top: 1em;
        padding-right: 0;
        padding-left: 0;
        margin-top: 2em;
        margin-left: auto;
        margin-right: auto;
        border-top: none;
        background-repeat: repeat-x;
        background-position: left top;
        background-image: var(--zz-bg);
        background-color: var(--bg2);
        background-size: 1rem 1rem;
      }
    }
  }

  .footerList {
    font-size: 0.875rem;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    padding-top: 1em;
    padding-bottom: 1em;
    position: relative;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        max-width: 35rem;
        padding-top: 0.5em;
      }
    }
  }

  .footerItem {
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    margin-top: 0.5em;
    white-space: nowrap;
  }

  .footerAnchor {
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
  }
`
