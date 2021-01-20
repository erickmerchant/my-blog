const fontWeights = {
  heading1: 900,
  heading2: 700,
  bold: 500,
  semibold: 300,
  normal: 100
}

export const _atrules = {
  colorSchemeDark: '@media (prefers-color-scheme: dark)',
  portraitUp: '@media (min-width: 500px) and (orientation: portrait)',
  tabletLandscapeUp:
    '@media (min-width: 950px), (min-width: 500px) and (orientation: landscape)',
  desktopUp: '@media (min-width: 1100px)',
  desktopDown: '@media (max-width: 1099px)',
  veryMobileDown: '@media (max-width: 349px)'
}

export const _start = `
  @font-face {
    font-display: swap;
    font-family: "Public Sans";
    font-style: normal;
    font-weight: 100 900;
    src: url("/fonts/public-sans/public-sans-subset.woff2") format("woff2");
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
    font-family: "Public Sans", system-ui, sans-serif;
    font-size: max(20px, 1vw);
    -webkit-text-size-adjust: none;
    line-height: 1.5;
    color: hsl(100, 10%, 20%);
    background-color: var(--bg);
    height: 100%;

    --bg: #fff;
  }

  ${_atrules.colorSchemeDark} {
    html {
      color: #fff;

      --bg: hsl(100, 10%, 20%);
    }
  }
`

const heading = `
  line-height: 1.25;
  margin-bottom: 0.5em;
  margin-top: 1em;
`

const heading1 = `
  ${heading}

  font-weight: ${fontWeights.heading1};
  font-size: 1.5em;

  ${_atrules.desktopUp} {
    margin-top: 2em;
  }
`

export const layoutClasses = {
  app: `
    display: grid;
    min-height: 100%;
    grid-template-rows: max-content auto max-content max-content;

    --a-c: hsl(100, 35%, 35%);
    --hero-a-c: inherit;
    --hero-bg: hsla(100, 35%, 40%, 0.9);
    --hero-b: var(--hero-bg);
    --ftr-bg: hsl(100, 10%, 95%);
    --ftr-zz:
      linear-gradient(225deg, var(--bg) 0.5rem, transparent 0),
      linear-gradient(135deg, var(--bg) 0.5rem, var(--ftr-bg) 0);
    --ftr-c: hsl(100, 10%, 20%);
    --ftr-hr-b: 1px solid hsl(100, 10%, 90%);

    ${_atrules.colorSchemeDark} {
      --a-c: hsl(100, 80%, 70%);
      --hero-a-c: hsl(100, 90%, 85%);
      --hero-bg: hsla(100, 20%, 20%, 0.9);
      --hero-b: hsl(100, 30%, 70%);
      --ftr-bg: var(--bg);
      --ftr-zz:
        linear-gradient(225deg, var(--bg) 25%, transparent 25%),
        linear-gradient(135deg, var(--bg) 25%, transparent 25%),
        linear-gradient(315deg, var(--bg) 25%, transparent 25%),
        linear-gradient(45deg, var(--bg) 25%, transparent 25%),
        linear-gradient(0deg, hsl(100, 30%, 70%) 0, hsl(100, 30%, 70%));
      --ftr-zz-posi: -0.25rem 0, -0.25rem 0, 0 0, 0 0;
      --ftr-zz-size: 0.5rem 0.5rem;
      --ftr-c: #fff;
      --ftr-hr-b: 1px dashed #fff;
    }

    ${_atrules.tabletLandscapeUp} {
      grid-template-columns: max-content 1fr;
      grid-template-rows: 1fr max-content max-content;
    }

    ${_atrules.desktopUp} {
      grid-template-columns: 1fr 2fr;
    }
  `,
  hero: `
    display: contents;

    ${_atrules.desktopUp} {
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
      border-right: 3px solid var(--hero-b);
    }
  `,
  headerAnchor: `
    color: var(--hero-a-c);
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;
  `,
  header: `
    font-weight: ${fontWeights.heading2};
    color: #fff;
    padding-top: 1em;
    padding-bottom: 1em;
    display: flex;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--hero-bg);
    border-bottom: var(--b);

    --b: 3px solid var(--hero-b);

    ${_atrules.tabletLandscapeUp} {
      font-size: clamp(1em, 4vh, 1.5em);
      height: 100vh;
      grid-row: 1 / -1;
      writing-mode: vertical-rl;
      border-bottom: none;
      transform: rotate(180deg);
      padding-right: 1em;
      padding-left: 1.25em;
      align-self: start;
      justify-content: center;
      border-left: var(--b);
    }

    ${_atrules.desktopUp} {
      ${heading}

      font-weight: ${fontWeights.heading1};
      font-size: 1.5em;
      writing-mode: horizontal-tb;
      transform: unset;
      background-color: transparent;
      border-left: none;
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
  footer: `
    color: var(--ftr-c);
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25em;
    width: 100%;
    background-color: var(--ftr-bg);
    border-top: var(--ftr-hr-b);

    ${_atrules.tabletLandscapeUp} {
      grid-column: 2;
      grid-row: 3;
    }

    ${_atrules.desktopUp} {
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
  footerList: `
    font-size: 0.875em;
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    padding-top: 1em;
    padding-bottom: 1em;
    position: relative;

    ${_atrules.desktopUp} {
      max-width: 100%;
      padding-top: 0.5em;
    }
  `,
  footerItem: `
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    margin-top: 0.25em;
    white-space: nowrap;
  `,
  footerAnchor: `
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
  `
}

export const aboutClasses = {
  about: `
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

    ${_atrules.tabletLandscapeUp} {
      grid-column: 2;
      grid-row: 2;
    }

    ${_atrules.desktopUp} {
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
  heading: `
    ${heading}

    font-weight: ${fontWeights.heading2};
    padding-top: 1em;

    ${_atrules.desktopDown} {
      max-width: 30rem;
      margin-right: auto;
      margin-left: auto;
    }
  `,
  anchor: `
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;

    ${_atrules.desktopUp} {
      color: var(--hero-a-c);
    }
  `,
  paragraph: `
    font-size: 0.875em;

    ${_atrules.desktopDown} {
      max-width: 30rem;
      margin-right: auto;
      margin-left: auto;
    }
  `,
  strong: `
    font-weight: ${fontWeights.semibold};
  `
}

const paginationItemDisabled = `
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

  ${_atrules.veryMobileDown} {
    --left-r: 0.125rem;
    --right-r: 0.125rem;
  }
`

const paginationItemEnabled = `
  ${paginationItemDisabled}

  color: var(--pg-enabled-c);
  background-color: var(--pg-enabled-bg);

  --b-c: var(--pg-enabled-b-c);

  :focus-within, :hover {
    background-color: var(--pg-enabled-hover-bg);

    --b-c: var(--pg-enabled-hover-b-c);
  }
`

const paginationItemNewer = `
  --right-r: var(--r);

  ${_atrules.desktopUp} {
    --left-r: var(--r);
  }
`

const paginationItemOlder = `
  --left-r: var(--r);

  ${_atrules.desktopUp} {
    --right-r: var(--r);
  }
`

const main = `
  opacity: 1;
  transition: opacity 0.3s;

  --code-c: hsl(100, 35%, 70%);
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

  ${_atrules.colorSchemeDark} {
    --code-c: hsl(100, 60%, 70%);
    --code-bg: hsl(100, 10%, 25%);
    --code-b: hsl(100, 30%, 70%);
    --code-inline-c: inherit;
    --code-inline-bg: var(--code-bg);
    --pg-disabled-bg: transparent;
    --pg-disabled-b-c: currentColor;
    --pg-disabled-c: hsl(100, 10%, 70%);
    --pg-enabled-hover-bg: hsla(100, 80%, 70%, 0.2);
    --pg-enabled-hover-b-c: currentColor;
    --pg-enabled-bg: transparent;
    --pg-enabled-b-c: currentColor;
    --pg-enabled-c: hsl(100, 80%, 70%);
    --date-fill: hsl(100, 60%, 70%);
  }

  ${_atrules.tabletLandscapeUp} {
    padding-top: 5vw;
  }

  ${_atrules.desktopUp} {
    padding-top: 0;
  }
`

const mainItem = `
  max-width: 31rem;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  margin-right: auto;
  margin-left: auto;

  ${_atrules.tabletLandscapeUp} {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  ${_atrules.desktopUp} {
    margin-right: 2rem;
    margin-left: 2rem;
  }
`

export const mainClasses = {
  heading1,
  main,
  mainTransitioning: `
    ${main}

    opacity: 0;
    transition: none;
  `,
  header: `
    ${mainItem}
  `,
  heading2: `
    ${mainItem}

    ${heading}

    font-weight: ${fontWeights.heading2};
  `,
  strong: `
    font-weight: ${fontWeights.bold};
  `,
  pre: `
    display: block;

    ${_atrules.tabletLandscapeUp} {
      padding-right: 0.75em;
      padding-left: 0.75em;
    }
  `,
  codeBlock: `
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

    --b: 1px solid var(--code-b);

    ${_atrules.portraitUp} {
      margin-right: auto;
      margin-left: auto;
    }

    ${_atrules.tabletLandscapeUp} {
      border-right: var(--b);
      border-left: var(--b);
      max-width: 32rem;
      border-radius: 0.125rem;
      margin-right: auto;
      margin-left: auto;
      padding-right: 1.5rem;
      padding-left: 1.5rem;
    }

    ${_atrules.desktopUp} {
      max-width: 100%;
      width: auto;
      margin-right: 1rem;
      margin-left: 1rem;
      padding-right: 1.5rem;
      padding-left: 1.5rem;
    }
  `,
  codeInline: `
    font-family: Consolas, monaco, monospace;
    font-size: 0.875em;
    color: var(--code-inline-c);
    display: inline-block;
    border-radius: 0.125rem;
    padding-right: 0.125rem;
    padding-left: 0.125rem;
    word-break: break-word;
    background-color: var(--code-inline-bg);
  `,
  anchor: `
    font-weight: ${fontWeights.semibold};
    color: var(--a-c);
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
  `,
  list: `
    ${mainItem}

    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 0.5rem;
    list-style: none;
  `,
  listItem: `
    margin-bottom: 0.25em;

    ::before {
      font-weight: ${fontWeights.bold};
      color: currentColor;
      margin-right: 0.5rem;
      content: '-';
    }
  `,
  paragraph: `
    ${mainItem}

    margin-top: 1em;
    margin-bottom: 1em;
    word-break: break-word;
  `,
  date: `
    font-weight: ${fontWeights.semibold};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  `,
  dateIcon: `
    height: 1em;
    margin-right: 0.3rem;
  `,
  dateIconPart: `
    fill: var(--date-fill, currentColor);
  `,
  pagination: `
    ${mainItem}

    margin-top: 2em;

    ${_atrules.veryMobileDown} {
      padding-right: 0.0625rem;
      padding-left: 0.0625rem;
    }

    ${_atrules.desktopUp} {
      margin-right: auto;
      margin-left: auto;
      padding-right: 2rem;
      padding-left: 2rem;
    }
  `,
  paginationList: `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
    text-align: center;
    list-style: none;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    gap: 0.125rem;

    ${_atrules.desktopUp} {
      gap: 0.5rem;
    }

    ${_atrules.veryMobileDown} {
      padding-right: 0.125rem;
      padding-left: 0.125rem;
    }
  `,
  paginationItemDisabledNewer: `
    ${paginationItemDisabled}
    ${paginationItemNewer}
  `,
  paginationItemEnabledNewer: `
    ${paginationItemEnabled}
    ${paginationItemNewer}
  `,
  paginationItemDisabledOlder: `
    ${paginationItemDisabled}
    ${paginationItemOlder}
  `,
  paginationItemEnabledOlder: `
    ${paginationItemEnabled}
    ${paginationItemOlder}
  `,
  paginationAnchor: `
    color: inherit;
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
      border-top-right-radius: var(--right-r, 0.125rem);
      border-bottom-right-radius: var(--right-r, 0.125rem);
      border-top-left-radius: var(--left-r, 0.125rem);
      border-bottom-left-radius: var(--left-r, 0.125rem);
    }
  `
}
