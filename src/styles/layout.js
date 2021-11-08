import {css} from 'dedupe.css';

import {fontWeights, mixins, mq} from './core.js';

export const layoutClasses = css`
  .app {
    display: grid;
    min-height: 100%;
    grid-template-rows: max-content 1fr max-content max-content;
    grid-template-columns: 100%;
    color: hsl(var(--c));
    background-color: hsl(var(--bg));
    overflow: var(--app-overflow);
    max-width: 100%;
    overflow-x: hidden;

    --hdr-bg-partial: hsl(var(--hdr-bg-ln-c)) 1px, transparent 1px;
    --hdr-bg-i: linear-gradient(0deg, var(--hdr-bg-partial)),
      linear-gradient(90deg, var(--hdr-bg-partial));
    --c: 90 0% 35%;
    --c2: inherit;
    --bg: 0 0% 100%;
    --bg2: 90 0% 99%;
    --a-c: inherit;
    --btn-bg-on: var(--bg2);
    --btn-bg-off: var(--bg2);
    --hdr-bg-ln-c: var(--c) / 0.05;
    --hdr-bg: var(--bg2);
    --code-c: inherit;
    --i-code-c: inherit;

    ${[
      (body) => `@media ${mq.colorSchemeLight} { &.auto { ${body} } }`,
      (body) => `&.light { ${body} }`,
    ]
      .map((condition) =>
        condition(`
          --c: 70 10% 20%;
          --c2: 70 5% 35%;
          --bg: 0 0% 100%;
          --bg2: 70 25% 97%;
          --a-c: 70 35% 35%;
          --btn-bg-on: 70 80% 70%;
          --btn-bg-off: 70 10% 70%;
          --hdr-bg-ln-c: var(--a-c) / 0.15;
          --hdr-bg: 70 95% 95%;
          --code-c: hsl(70 45% 30%);
          --i-code-c: inherit;
        `)
      )
      .join('')}

    ${[
      (body) => `@media ${mq.colorSchemeDark} { &.auto { ${body} } }`,
      (body) => `&.dark { ${body} }`,
    ]
      .map((condition) =>
        condition(`
          --c: 0 0% 100%;
          --c2: 100 5% 70%;
          --bg: 100 10% 15%;
          --bg2: 100 10% 17.5%;
          --a-c: 100 80% 70%;
          --btn-bg-on: 100 80% 70%;
          --btn-bg-off: 100 10% 70%;
          --hdr-bg-ln-c: var(--a-c) / 0.075;
          --hdr-bg: 100 35% 17.5%;
          --code-c: hsl(100 45% 70%);
          --i-code-c: hsl(100 45% 70%);
        `)
      )
      .join('')}

    @media ${mq.desktopUp} and ${mq.tallUp} {
      grid-template-columns: calc(100% / 3) calc(100% / 3 * 2);
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
    border-bottom: 3px solid hsl(var(--a-c));
    grid-row: 1;
    grid-column: 1;
    width: 100vw;

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
      grid-row: 1;
      height: max-content;
      display: grid;
      grid-template-rows: 1fr;
      grid-template-columns: 90%;
      align-items: start;
      width: auto;
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
      inset: 0;
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
      min-height: min-content;
      padding-top: 5em;
      display: grid;
      justify-content: center;
      grid-auto-rows: 1fr;
      grid-template-columns: 90%;
      background-color: hsl(var(--hdr-bg) / 0.9);
      background-image: var(--hdr-bg-i);
      background-size: 1rem 1rem;
      background-position: 50% 0;
      background-attachment: fixed;
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

    @media ${mq.desktopUp} and ${mq.tallUp} {
      max-width: 35rem;
      padding-top: 0.5em;
    }
  }

  .footerItem {
    white-space: nowrap;
    display: inline-grid;
    grid-template-columns: max-content auto 1fr;
  }

  .footerAnchor {
    ${mixins.navAnchor}
  }
`;
