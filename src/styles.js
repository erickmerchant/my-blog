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
  desktopLandscape: '@media (min-width: 1024px) and (orientation: landscape)',
  minHeightNotDesktopOrLandscape:
    '@media (min-height: 568px) and (max-width: 1023px), (min-height: 568px) and (orientation: portrait)',
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
    color: hsl(100, 10%, 20%);
    background-color: var(--bg);
    height: 100%;
    scroll-padding-top: 90px;

    --bg: #fff;
  }

  ${_atrules.colorSchemeDark} {
    html {
      color: #fff;

      --bg: hsl(100, 10%, 20%);
    }
  }
`

const heading = css`
   {
    line-height: 1.25;
    margin-bottom: 0.5em;
    margin-top: 1em;
  }
`

const heading1 = css`
   {
    ${heading}

    font-weight: ${fontWeights.heading1};
    font-size: 1.5em;
  }

  ${_atrules.desktopLandscape} {
    margin-top: 2em;
  }
`

export const layoutClasses = {
  app: css`
     {
      display: grid;
      min-height: 100%;
      grid-template-rows: max-content auto max-content max-content;

      --grid-gradient: linear-gradient(
          to right,
          transparent 0,
          transparent 1px,
          hsla(0, 0%, 100%, 0.05) 1px,
          hsla(0, 0%, 100%, 0.05) 2px,
          transparent 2px
        ),
        linear-gradient(
          to bottom,
          transparent 0,
          transparent 1px,
          hsla(0, 0%, 100%, 0.05) 1px,
          hsla(0, 0%, 100%, 0.05) 2px,
          transparent 2px
        );

      --a-c: hsl(100, 35%, 35%);
      --hero-a-c: inherit;
      --hero-bg: hsla(100, 35%, 40%, 0.9);
      --hero-bg-size: 2em 2em;
      --hero-b: var(--hero-bg);
      --ftr-bg: hsl(100, 10%, 95%);
      --ftr-zz: linear-gradient(225deg, var(--bg) 0.5rem, transparent 0),
        linear-gradient(135deg, var(--bg) 0.5rem, var(--ftr-bg) 0);
      --ftr-c: hsl(100, 10%, 20%);
      --ftr-hr-b: 1px solid hsl(100, 10%, 90%);
    }

    ${_atrules.colorSchemeDark} {
      --a-c: hsl(100, 80%, 70%);
      --hero-a-c: hsl(100, 90%, 85%);
      --hero-bg: hsla(100, 20%, 20%, 0.9);
      --hero-bg-size: 1em 1em;
      --hero-b: hsl(100, 30%, 70%);
      --ftr-bg: var(--bg);
      --ftr-zz: linear-gradient(225deg, var(--bg) 25%, transparent 25%),
        linear-gradient(135deg, var(--bg) 25%, transparent 25%),
        linear-gradient(315deg, var(--bg) 25%, transparent 25%),
        linear-gradient(45deg, var(--bg) 25%, transparent 25%),
        linear-gradient(0deg, hsl(100, 30%, 70%) 0, hsl(100, 30%, 70%));
      --ftr-zz-posi: -0.25rem 0, -0.25rem 0, 0 0, 0 0;
      --ftr-zz-size: 0.5rem 0.5rem;
      --ftr-c: #fff;
      --ftr-hr-b: 1px dashed #fff;
    }

    ${_atrules.desktopLandscape} {
      grid-template-columns: 1fr 2fr;
    }
  `,
  hero: css`
     {
      display: contents;

      --b: 2px solid var(--hero-b);
    }

    ${_atrules.desktopLandscape} {
      color: #fff;
      grid-row: 1 / -1;
      position: sticky;
      top: 0;
      height: 100vh;
      display: grid;
      justify-content: center;
      grid-auto-rows: 1fr;
      grid-template-columns: 90%;
      overflow-y: scroll;
      background-color: var(--hero-bg);
      background-image: var(--grid-gradient);
      background-size: var(--hero-bg-size);
      border-right: var(--b);
    }
  `,
  headerAnchor: css`
     {
      color: var(--hero-a-c);
      text-decoration-thickness: 0.125em;
      text-underline-offset: 0.125em;
    }
  `,
  header: css`
     {
      font-weight: ${fontWeights.heading2};
      color: #fff;
      padding-top: 1em;
      padding-bottom: 1em;
      display: flex;
      justify-content: center;
      background-color: var(--hero-bg);
      background-image: var(--grid-gradient);
      background-size: var(--hero-bg-size);
      background-position: 50% 0;
      border-bottom: var(--b);

      ${_atrules.minHeightNotDesktopOrLandscape} {
        position: sticky;
        top: 0;
        z-index: 1;
      }
    }

    ${_atrules.desktopLandscape} {
      ${heading}

      font-weight: ${fontWeights.heading1};
      font-size: 1.5em;
      writing-mode: horizontal-tb;
      transform: unset;
      background-image: none;
      background-color: transparent;
      border-left: none;
      border-bottom: none;
      justify-content: start;
      padding-top: 0;
      padding-right: 0;
      padding-left: 0;
      margin-top: 2em;
      position: relative;
      max-width: max-content;
      height: auto;
    }
  `,
  footer: css`
     {
      display: var(--below-main-display, none);
      color: var(--ftr-c);
      padding-right: 0.5rem;
      padding-left: 0.5rem;
      padding-bottom: 0.25em;
      width: 100%;
      background-color: var(--ftr-bg);
      border-top: var(--ftr-hr-b);
    }

    ${_atrules.desktopLandscape} {
      padding-top: 1em;
      padding-right: 0;
      padding-left: 0;
      margin-top: 2em;
      margin-left: auto;
      margin-right: auto;
      background-repeat: repeat-x;
      border-top: none;
      background-image: var(--ftr-zz);
      background-color: var(--ftr-bg);
      background-position: var(--ftr-zz-posi, left top);
      background-size: var(--ftr-zz-size, 1rem 1rem);
    }
  `,
  footerList: css`
     {
      font-size: 0.875em;
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      width: 100%;
      padding-top: 1em;
      padding-bottom: 1em;
      position: relative;
    }

    ${_atrules.desktopLandscape} {
      max-width: 100%;
      padding-top: 0.5em;
    }
  `,
  footerItem: css`
     {
      margin-right: 0.5rem;
      margin-left: 0.5rem;
      margin-top: 0.25em;
      white-space: nowrap;
    }
  `,
  footerAnchor: css`
     {
      color: var(--a-c);
      text-decoration-thickness: 0.0625em;
      text-underline-offset: 0.1875em;
    }
  `
}

export const aboutClasses = {
  about: css`
     {
      display: var(--below-main-display, none);
      color: var(--ftr-c);
      grid-row: 3;
      margin-top: 2em;
      background-repeat: repeat-x;
      padding-right: 0.5rem;
      padding-left: 0.5rem;
      padding-bottom: 1em;
      background-color: var(--ftr-bg);
      background-image: var(--ftr-zz);
      background-position: var(--ftr-zz-posi, left top);
      background-size: var(--ftr-zz-size, 1rem 1rem);
    }

    ${_atrules.desktopLandscape} {
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
  `,
  heading: css`
     {
      ${heading}

      font-weight: ${fontWeights.heading2};
      padding-top: 1em;
      max-width: 30rem;
      margin-right: auto;
      margin-left: auto;
    }

    ${_atrules.desktopLandscape} {
      max-width: 100%;
    }
  `,
  anchor: css`
     {
      color: var(--a-c);
      text-decoration-thickness: 0.0625em;
      text-underline-offset: 0.1875em;
    }

    ${_atrules.desktopLandscape} {
      color: var(--hero-a-c);
    }
  `,
  paragraph: css`
     {
      font-size: 0.875em;
      max-width: 30rem;
      margin-right: auto;
      margin-left: auto;
    }

    ${_atrules.desktopLandscape} {
      max-width: 100%;
    }
  `,
  strong: css`
     {
      font-weight: ${fontWeights.semibold};
    }
  `
}

const paginationItemDisabled = css`
   {
    font-weight: ${fontWeights.heading2};
    color: var(--pg-disabled-c);
    position: relative;
    padding-top: 0.875em;
    padding-bottom: 0.875em;
    background-color: var(--pg-disabled-bg);
    border: 3px solid var(--b-c);
    border-top-right-radius: var(--right-r, 0.125rem);
    border-bottom-right-radius: var(--right-r, 0.125rem);
    border-top-left-radius: var(--left-r, 0.125rem);
    border-bottom-left-radius: var(--left-r, 0.125rem);

    --r: 1.5rem 50%;
    --b-c: var(--pg-disabled-b-c);
  }

  ${_atrules.veryMobile} {
    --left-r: 0.125rem;
    --right-r: 0.125rem;
  }
`

const paginationItemEnabled = css`
   {
    ${paginationItemDisabled}

    color: var(--pg-enabled-c);
    background-color: var(--pg-enabled-bg);

    --b-c: var(--pg-enabled-b-c);
  }

  :focus-within,
  :hover {
    background-color: var(--pg-enabled-hover-bg);

    --b-c: var(--pg-enabled-hover-b-c);
  }
`

const paginationItemNewer = css`
   {
    --right-r: var(--r);
  }

  ${_atrules.tabletUp} {
    --left-r: var(--r);
  }
`

const paginationItemOlder = css`
   {
    --left-r: var(--r);
  }

  ${_atrules.tabletUp} {
    --right-r: var(--r);
  }
`

const main = css`
   {
    opacity: 1;
    transition: opacity 0.3s;

    --header-a-c: hsl(100, 10%, 90%);
    --code-c: hsl(100, 35%, 70%);
    --code-str-c: hsl(100, 45%, 90%);
    --code-bg: hsl(100, 10%, 20%);
    --code-b: var(--code-bg);
    --code-inline-c: hsl(100, 35%, 20%);
    --code-inline-bg: hsl(100, 10%, 90%);
    --pg-disabled-bg: hsl(100, 10%, 45%);
    --pg-disabled-b-c: var(--pg-disabled-bg);
    --pg-disabled-c: #fff;
    --pg-enabled-hover-bg: hsl(100, 45%, 45%);
    --pg-enabled-hover-b-c: var(--pg-enabled-hover-bg);
    --pg-enabled-bg: hsl(100, 35%, 45%);
    --pg-enabled-b-c: var(--pg-enabled-bg);
    --pg-enabled-c: #fff;
  }

  ${_atrules.colorSchemeDark} {
    --header-a-c: hsl(100, 60%, 70%);
    --code-c: hsl(100, 60%, 70%);
    --code-str-c: hsl(100, 70%, 90%);
    --code-bg: hsl(100, 10%, 25%);
    --code-b: hsl(100, 30%, 70%);
    --code-inline-c: inherit;
    --code-inline-bg: var(--code-bg);
    --pg-disabled-bg: transparent;
    --pg-disabled-b-c: currentColor;
    --pg-disabled-c: hsl(100, 10%, 70%);
    --pg-enabled-hover-bg: hsla(100, 80%, 70%, 0.3);
    --pg-enabled-hover-b-c: currentColor;
    --pg-enabled-bg: hsla(100, 80%, 70%, 0.2);
    --pg-enabled-b-c: currentColor;
    --pg-enabled-c: hsl(100, 80%, 70%);
    --date-fill: hsl(100, 60%, 70%);
  }

  ${_atrules.desktopLandscape} {
    padding-top: 0;
  }
`

const mainItem = css`
   {
    max-width: 31rem;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    margin-right: auto;
    margin-left: auto;
  }

  ${_atrules.desktopLandscape} {
    margin-right: 2rem;
    margin-left: 2rem;
  }
`

export const mainClasses = {
  heading1,
  main,
  mainTransitioning: css`
     {
      ${main}

      opacity: 0;
      transition: none;
    }
  `,
  header: css`
     {
      ${mainItem}
    }
  `,
  heading2: css`
     {
      ${mainItem}

      ${heading}

    font-weight: ${fontWeights.heading2};
    }

    :hover {
      --a-display: inline;
    }
  `,
  heading2Anchor: css`
    color: var(--header-a-c);
    text-decoration: none;
    margin-left: 0.5em;
    display: var(--a-display, none);
  `,
  strong: css`
     {
      font-weight: ${fontWeights.bold};
      color: var(--str-c, inherit);
    }
  `,
  pre: css`
     {
      display: block;
    }
  `,
  codeBlock: css`
     {
      font-family: Consolas, monaco, monospace;
      font-size: 0.875em;
      color: var(--code-c);
      display: block;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      padding-top: 1em;
      padding-bottom: 1em;
      padding-right: 0.5rem;
      padding-left: 0.5rem;
      width: 100%;
      background-color: var(--code-bg);
      border-top: var(--b);
      border-bottom: var(--b);

      --str-c: var(--code-str-c);
      --b: 1px solid var(--code-b);
    }

    ${_atrules.tabletUp} {
      max-width: 100%;
      width: auto;
      margin-right: 1rem;
      margin-left: 1rem;
      padding-right: 1.5rem;
      padding-left: 1.5rem;
      border-left: var(--b);
      border-right: var(--b);
      border-radius: 0.125rem;
    }
  `,
  codeInline: css`
     {
      font-family: Consolas, monaco, monospace;
      font-size: 0.875em;
      color: var(--code-inline-c);
      display: inline-block;
      border-radius: 0.125rem;
      padding-right: 0.125rem;
      padding-left: 0.125rem;
      word-break: break-word;
      background-color: var(--code-inline-bg);
    }
  `,
  anchor: css`
     {
      font-weight: ${fontWeights.semibold};
      color: var(--a-c);
      text-decoration-thickness: 0.0625em;
      text-underline-offset: 0.1875em;
    }
  `,
  list: css`
     {
      ${mainItem}

      margin-top: 1em;
      margin-bottom: 1em;
      padding-left: 0.5rem;
      list-style: none;
    }
  `,
  listItem: css`
     {
      margin-bottom: 0.25em;
    }

    ::before {
      font-weight: ${fontWeights.bold};
      color: currentColor;
      margin-right: 0.5rem;
      content: '-';
    }
  `,
  paragraph: css`
     {
      ${mainItem}

      margin-top: 1em;
      margin-bottom: 1em;
      word-break: break-word;
    }
  `,
  date: css`
     {
      font-weight: ${fontWeights.semibold};
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
  `,
  dateIcon: css`
     {
      height: 1em;
      margin-right: 0.3rem;
    }
  `,
  dateFG: css`
     {
      fill: var(--date-fill, currentColor);
    }
  `,
  dateBG: css`
     {
      fill: var(--bg);
    }
  `,
  pagination: css`
     {
      ${mainItem}

      margin-top: 2em;
    }

    ${_atrules.desktopLandscape} {
      max-width: 100%;
      margin-right: 2rem;
      margin-left: 2rem;
    }
  `,
  paginationList: css`
     {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
      text-align: center;
      list-style: none;
      gap: 0.25rem;
    }

    ${_atrules.tabletUp} {
      gap: 3vw;
    }
  `,
  paginationItemDisabledNewer: css`
     {
      ${paginationItemDisabled}
      ${paginationItemNewer}
    }
  `,
  paginationItemEnabledNewer: css`
     {
      ${paginationItemEnabled}
      ${paginationItemNewer}
    }
  `,
  paginationItemDisabledOlder: css`
     {
      ${paginationItemDisabled}
      ${paginationItemOlder}
    }
  `,
  paginationItemEnabledOlder: css`
     {
      ${paginationItemEnabled}
      ${paginationItemOlder}
    }
  `,
  paginationAnchor: css`
     {
      color: inherit;
      text-decoration-thickness: 0.125em;
      text-underline-offset: 0.125em;
      -webkit-tap-highlight-color: transparent;
    }

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
  `
}
