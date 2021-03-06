import {css} from '@erickmerchant/css'

const fontWeights = {
  heading1: 900,
  heading2: 700,
  bold: 500,
  semibold: 300,
  normal: 100
}

export const _atrules = {
  colorSchemeDark: '@media (prefers-color-scheme: dark)',
  tabletUp: '@media (min-width: 768px)',
  desktopAndTallUp: '@media (min-width: 1024px) and (min-height: 350px)',
  tallUp: '@media (min-height: 350px)',
  veryMobile: '@media (max-width: 375px)'
}

export const _start = css`
  @font-face {
    font-display: swap;
    font-family: 'Public Sans';
    font-style: normal;
    font-weight: 100 900;
    src: url('/fonts/public-sans/public-sans-subset.woff2') format('woff2');
  }

  * {
    box-sizing: border-box;
    max-width: 100%;
    margin: 0;
    padding: 0;
    font: inherit;
  }

  html {
    font-weight: ${fontWeights.normal};
    font-family: 'Public Sans', system-ui, sans-serif;
    font-size: max(20px, 1vw);
    -webkit-text-size-adjust: none;
    line-height: 1.5;
    height: 100%;
    scroll-padding-top: 90px;
  }
`

const mixins = css`
  .heading {
    line-height: 1.25;
    margin-bottom: 0.5em;
    margin-top: 1em;
  }
`

export const layoutClasses = css`
  .app {
    display: grid;
    min-height: 100%;
    grid-template-rows: max-content 1fr max-content max-content;
    color: var(--c);
    background-color: var(--bg);

    --c: hsl(90, 10%, 20%);
    --bg: #fff;
    --grid-c: hsla(0, 0%, 100%, 0.1);
    --a-c: hsl(90, 35%, 35%);
    --hdr-a-c: #fff;
    --hdr-c: #fff;
    --hdr-bg: hsla(90, 35%, 40%, 0.9);
    --hdr-bg-i: linear-gradient(0deg, var(--grid-c) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-c) 1px, transparent 1px);
    --hdr-bg-size: 2rem 2rem;
    --hdr-b: transparent;
    --ftr-bg: hsl(90, 10%, 95%);
    --ftr-bg-i: linear-gradient(225deg, var(--bg) 0.5rem, transparent 0),
      linear-gradient(135deg, var(--bg) 0.5rem, var(--ftr-bg) 0);
    --ftr-bg-i-posi: left top;
    --ftr-bg-i-size: 1rem 1rem;
    --ftr-c: var(--c);
    --ftr-hr-b: 1px solid hsl(90, 10%, 90%);

    ${_atrules.colorSchemeDark} {
      --c: #fff;
      --bg: hsl(100, 10%, 15%);
      --grid-c: hsla(0, 0%, 100%, 0.05);
      --a-c: hsl(100, 80%, 70%);
      --hdr-a-c: hsl(100, 90%, 85%);
      --hdr-c: #fff;
      --hdr-bg: hsla(100, 20%, 17.5%, 0.9);
      --hdr-bg-size: 1rem 1rem;
      --hdr-b: hsl(100, 30%, 70%);
      --ftr-bg: var(--bg);
      --ftr-bg-i: linear-gradient(
          225deg,
          var(--bg) 0.175rem,
          transparent 0.175rem
        ),
        linear-gradient(135deg, var(--bg) 0.175rem, transparent 0.175rem),
        linear-gradient(315deg, var(--bg) 0.175rem, transparent 0.175rem),
        linear-gradient(45deg, var(--bg) 0.175rem, transparent 0.175rem),
        linear-gradient(0deg, var(--hdr-b) 0, var(--hdr-b));
      --ftr-bg-i-posi: -0.25rem 0, -0.25rem 0, 0 0, 0 0;
      --ftr-bg-i-size: 0.5rem 0.5rem;
      --ftr-c: #fff;
      --ftr-hr-b: 1px dashed #fff;
    }

    ${_atrules.desktopAndTallUp} {
      grid-template-columns: 1fr 2fr;
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
    }

    ${_atrules.desktopAndTallUp} {
      font-weight: ${fontWeights.heading1};
      font-size: 1.5em;
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

  .headerAnchor {
    color: var(--hdr-a-c);
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;

    ${_atrules.desktopAndTallUp} {
      ${mixins.heading}

      margin-top: 2em;
    }
  }

  .aside {
    display: contents;

    ${_atrules.desktopAndTallUp} {
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

  .footer {
    display: var(--below-main-display, none);
    color: var(--ftr-c);
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25em;
    width: 100%;
    background-color: var(--ftr-bg);
    border-top: var(--ftr-hr-b);

    ${_atrules.desktopAndTallUp} {
      grid-row: 3;
      grid-column: 2;
      padding-top: 1em;
      padding-right: 0;
      padding-left: 0;
      margin-top: 2em;
      margin-left: auto;
      margin-right: auto;
      background-repeat: repeat-x;
      border-top: none;
      background-image: var(--ftr-bg-i);
      background-color: var(--ftr-bg);
      background-position: var(--ftr-bg-i-posi);
      background-size: var(--ftr-bg-i-size);
    }
  }

  .footerList {
    font-size: 0.875em;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    padding-top: 1em;
    padding-bottom: 1em;
    position: relative;

    ${_atrules.desktopAndTallUp} {
      max-width: 35rem;
      padding-top: 0.5em;
    }
  }

  .footerItem {
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    margin-top: 0.25em;
    white-space: nowrap;
  }

  .footerAnchor {
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
  }
`

export const aboutClasses = css`
  .about {
    display: var(--below-main-display, none);
    color: var(--ftr-c);
    grid-row: 3;
    margin-top: 2em;
    background-repeat: repeat-x;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 1em;
    background-color: var(--ftr-bg);
    background-image: var(--ftr-bg-i);
    background-position: var(--ftr-bg-i-posi);
    background-size: var(--ftr-bg-i-size);

    ${_atrules.desktopAndTallUp} {
      display: block;
      color: inherit;
      grid-column: 1;
      background-image: none;
      background-color: transparent;
      padding-bottom: 2em;
      padding-left: 0;
      padding-right: 0;
      max-width: 20rem;
    }
  }

  .heading {
    ${mixins.heading}

    font-weight: ${fontWeights.heading2};
    padding-top: 1em;
    max-width: 30rem;
    margin-right: auto;
    margin-left: auto;

    ${_atrules.desktopAndTallUp} {
      max-width: 100%;
    }
  }

  .anchor {
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;

    ${_atrules.desktopAndTallUp} {
      color: var(--hdr-a-c);
    }
  }

  .paragraph {
    font-size: 0.875em;
    max-width: 30rem;
    margin-right: auto;
    margin-left: auto;

    ${_atrules.desktopAndTallUp} {
      max-width: 100%;
    }
  }

  .bold {
    font-weight: ${fontWeights.semibold};
  }
`

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
    border-top-right-radius: var(--right-r, 0.125rem);
    border-bottom-right-radius: var(--right-r, 0.125rem);
    border-top-left-radius: var(--left-r, 0.125rem);
    border-bottom-left-radius: var(--left-r, 0.125rem);

    --r: 1.5rem 50%;
    --bg: hsl(90, 10%, 45%);
    --b-c: var(--bg);
    --c: #fff;

    ${_atrules.veryMobile} {
      --left-r: 0.125rem;
      --right-r: 0.125rem;
    }

    ${_atrules.colorSchemeDark} {
      --bg: transparent;
      --b-c: currentColor;
      --c: hsl(100, 10%, 70%);
    }
  }

  .enabled {
    --hover-bg: hsl(90, 45%, 45%);
    --hover-b-c: var(--hover-bg);
    --bg: hsl(90, 35%, 45%);
    --b-c: var(--bg);
    --c: #fff;

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
    --right-r: var(--r);

    ${_atrules.tabletUp} {
      --left-r: var(--r);
    }
  }

  .older {
    --left-r: var(--r);

    ${_atrules.tabletUp} {
      --right-r: var(--r);
    }
  }
`

export const mainClasses = css`
  .heading1 {
    ${mixins.heading}

    font-weight: ${fontWeights.heading1};
    font-size: 1.5em;

    ${_atrules.desktopAndTallUp} {
      margin-top: 2em;
    }
  }

  .main,
  .mainTransitioning {
    opacity: 1;
    transition: opacity 0.3s;

    ${_atrules.desktopAndTallUp} {
      padding-top: 0;
    }
  }

  .mainTransitioning {
    opacity: 0;
    transition: none;
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

    ${_atrules.desktopAndTallUp} {
      margin-right: 2rem;
      margin-left: 2rem;
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
    color: hsl(90, 10%, 90%);

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
    font-family: Consolas, monaco, monospace;
    font-size: 0.875em;
    color: var(--c);
    display: block;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    width: 100%;
    background-color: var(--bg);

    --c: hsl(90, 35%, 70%);
    --str-c: hsl(90, 75%, 70%);
    --bg: hsl(90, 15%, 20%);

    ${_atrules.tabletUp} {
      max-width: 100%;
      width: auto;
      margin-right: 1rem;
      margin-left: 1rem;
      padding-right: 1rem;
      padding-left: 1rem;
      border-radius: 0.125rem;
    }

    ${_atrules.colorSchemeDark} {
      --c: hsl(100, 45%, 70%);
      --str-c: hsl(100, 85%, 70%);
      --bg: hsl(100, 10%, 17.5%);
    }
  }

  .codeInline {
    font-family: Consolas, monaco, monospace;
    font-size: 0.875em;
    color: var(--c);
    display: inline-block;
    border-radius: 0.125rem;
    padding-right: 0.125rem;
    padding-left: 0.125rem;
    word-break: break-word;
    background-color: var(--bg);

    --c: hsl(90, 35%, 20%);
    --bg: hsl(90, 10%, 90%);

    ${_atrules.colorSchemeDark} {
      --c: var(--c);
      --bg: var(--bg);
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

    ::before {
      font-weight: ${fontWeights.bold};
      color: currentColor;
      margin-right: 0.5rem;
      content: '-';
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
      border-top-right-radius: var(--right-r, 0.125rem);
      border-bottom-right-radius: var(--right-r, 0.125rem);
      border-top-left-radius: var(--left-r, 0.125rem);
      border-bottom-left-radius: var(--left-r, 0.125rem);
    }
  }
`
