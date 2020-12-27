const fontWeights = {
  heading1: 900,
  heading2: 700,
  bold: 500,
  semibold: 300,
  normal: 100
}

export const _atrules = {
  colorSchemeDark: '@media (prefers-color-scheme: dark)',
  mobileUp: '@media (min-width: 641px)',
  tabletUp: '@media (min-width: 832px)',
  desktopUp: '@media (min-width: 1024px)',
  desktopDown: '@media (max-width: 1023px)',
  veryMobileDown: '@media (max-width: 320px)'
}

export const _start = `
  @font-face {
    font-display: swap;
    font-family: "Public Sans";
    font-style: normal;
    font-weight: 100 900;
    src: url("/fonts/Public_Sans/PublicSans-VariableFont_wght-subset.woff2") format("woff2");
  }

  * {
    box-sizing: border-box;
    max-width: 100%;
    margin: 0;
    padding: 0;
    font: inherit;
    font-weight: inherit;
  }

  html {
    font-weight: ${fontWeights.normal};
    font-family: "Public Sans", system-ui, sans-serif;
    font-size: max(20px, 1vw);
    line-height: 1.5;
    color: hsl(100, 10%, 20%);
    background-color: #fff;
    height: 100%;

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
    --hero-bg: hsla(100, 35%, 40%, 0.9);
    --hero-b: var(--hero-bg);
    --ftr-bg: hsl(100, 10%, 95%);
    --ftr-zz:
      linear-gradient(-135deg, #fff 0.5rem, transparent 0),
      linear-gradient(135deg, #fff 0.5rem, var(--ftr-bg) 0);
    --ftr-c: hsl(100, 10%, 20%);
    --a-c: hsl(100, 35%, 35%);
    --mid-b: 1px solid hsl(100, 10%, 90%);
  }

  ${_atrules.colorSchemeDark} {
    html {
      color: #fff;
      background-color: hsl(100, 10%, 20%);

      --code-c: hsl(100, 60%, 70%);
      --code-bg: hsl(100, 10%, 25%);
      --code-b: hsl(100, 30%, 70%);
      --code-inline-c: inherit;
      --code-inline-bg: hsl(100, 10%, 25%);
      --pg-disabled-bg: transparent;
      --pg-disabled-b-c: currentColor;
      --pg-disabled-c: hsl(100, 10%, 70%);
      --pg-enabled-hover-bg: hsla(100, 80%, 70%, 0.2);
      --pg-enabled-hover-b-c: currentColor;
      --pg-enabled-bg: transparent;
      --pg-enabled-b-c: currentColor;
      --pg-enabled-c: hsl(100, 80%, 70%);
      --hero-bg: hsla(100, 20%, 20%, 0.9);
      --hero-b: hsl(100, 30%, 70%);
      --ftr-bg: hsl(100, 10%, 20%);
      --ftr-zz:
        linear-gradient(135deg, var(--ftr-bg) 25%, transparent 25%),
        linear-gradient(225deg, var(--ftr-bg) 25%, transparent 25%),
        linear-gradient(315deg, var(--ftr-bg) 25%, transparent 25%),
        linear-gradient(45deg, var(--ftr-bg) 25%, transparent 25%),
        linear-gradient(0deg, hsl(100, 30%, 70%) 0, hsl(100, 30%, 70%));
      --ftr-zz-posi: -0.25rem 0, -0.25rem 0, 0 0, 0 0;
      --ftr-zz-size: 0.5rem 0.5rem;
      --ftr-c: #fff;
      --a-c: hsl(100, 80%, 70%);
      --date-fill: hsl(100, 60%, 70%);
      --mid-b: 1px dashed #fff;
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

const paginationItemDisabled = `
  font-weight: ${fontWeights.heading2};
  position: relative;
  padding-top: 0.875em;
  padding-bottom: 0.875em;
  font-size: 1em;
  background-color: var(--pg-disabled-bg);
  border: 3px solid var(--border-color);
  color: var(--pg-disabled-c);
  border-top-right-radius: var(--right-radius, 0.125rem);
  border-bottom-right-radius: var(--right-radius, 0.125rem);
  border-top-left-radius: var(--left-radius, 0.125rem);
  border-bottom-left-radius: var(--left-radius, 0.125rem);

  --border-color: var(--pg-disabled-b-c);

  ${_atrules.veryMobileDown} {
    --left-radius: 0.125rem;
    --right-radius: 0.125rem;
  }
`

const paginationItemEnabled = `
  ${paginationItemDisabled}

  background-color: var(--pg-enabled-bg);
  color: var(--pg-enabled-c);

  --border-color: var(--pg-enabled-b-c);

  :focus-within, :hover {
    background-color: var(--pg-enabled-hover-bg);

    --border-color: var(--pg-enabled-hover-b-c);
  }
`

const paginationItemNewer = `
  --right-radius: 1.5rem 50%;

  ${_atrules.mobileUp} {
    --left-radius: 1.5rem 50%;
  }
`

const paginationItemOlder = `
  --left-radius: 1.5rem 50%;

  ${_atrules.mobileUp} {
    --right-radius: 1.5rem 50%;
  }
`

const main = `
  font-weight: ${fontWeights.normal};
  opacity: 1;
  transition: opacity 0.3s;
`

const mainItem = `
  max-width: 31rem;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  margin-right: auto;
  margin-left: auto;

  ${_atrules.desktopUp} {
    max-width: 34rem;
    padding-right: 1rem;
    padding-left: 1rem;
    margin-right: 2rem;
    margin-left: 2rem;
  }
`

export const layoutClasses = {
  app: `
    display: grid;
    min-height: 100%;
    grid-template-rows: max-content auto max-content max-content;

    ${_atrules.tabletUp} {
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
      grid-row: 1 / -1;
      color: #fff;
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
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;
    color: inherit;
  `,
  header: `
    font-weight: ${fontWeights.heading2};
    padding-top: 1em;
    padding-bottom: 1em;
    color: #fff;
    display: flex;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--hero-bg);
    border-bottom: 3px solid var(--hero-b);

    ${_atrules.tabletUp} {
      font-weight: ${fontWeights.heading1};
      height: 100vh;
      grid-row: 1 / -1;
      font-size: 1.5em;
      writing-mode: vertical-rl;
      border-bottom: none;
      transform: rotate(180deg);
      padding-right: 1em;
      padding-left: 1.25em;
      align-self: start;
      justify-content: center;
      border-left: 3px solid var(--hero-b);
    }

    ${_atrules.desktopUp} {
      ${heading}

      writing-mode: horizontal-tb;
      transform: rotate(0deg);
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
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25em;
    width: 100%;
    background-color: var(--ftr-bg);
    border-top: var(--mid-b);
    color: var(--ftr-c);

    ${_atrules.tabletUp} {
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
    font-size: 0.75em;
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
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;
    color: var(--a-c);
  `
}

export const aboutClasses = {
  about: `
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
    color: var(--ftr-c);

    ${_atrules.tabletUp} {
      grid-column: 2;
      grid-row: 2;
    }

    ${_atrules.desktopUp} {
      grid-column: 1;
      background-image: none;
      background-color: transparent;
      color: inherit;
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
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
    color: var(--a-c);

    ${_atrules.desktopUp} {
      color: var(--header-color);
    }
  `,
  paragraph: `
    font-weight: ${fontWeights.normal};
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
    display: contents;
  `,
  codeBlock: `
    display: block;
    font-family: Consolas, monaco, monospace;
    font-size: 0.875em;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    max-width: 32rem;
    width: 100%;
    color: var(--code-c);
    background-color: var(--code-bg);
    border-top: 1px solid var(--code-b);
    border-bottom: 1px solid var(--code-b);

    ${_atrules.mobileUp} {
      border-radius: 0.125rem;
      margin-right: auto;
      margin-left: auto;
      padding-right: 1rem;
      padding-left: 1rem;
      border-right: 1px solid var(--code-b);
      border-left: 1px solid var(--code-b);
    }

    ${_atrules.desktopUp} {
      max-width: 100%;
      width: auto;
      margin-right: 2rem;
      margin-left: 2rem;
    }
  `,
  codeInline: `
    display: inline-block;
    font-family: Consolas, monaco, monospace;
    font-size: 0.875em;
    border-radius: 0.125rem;
    padding-right: 0.125rem;
    padding-left: 0.125rem;
    word-break: break-word;
    background-color: var(--code-inline-bg);
    color: var(--code-inline-c);
  `,
  anchor: `
    font-weight: ${fontWeights.semibold};
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
    color: var(--a-c);
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
      margin-right: 0.5rem;
      content: '-';
      color: currentColor;
    }
  `,
  paragraph: `
    ${mainItem}

    margin-top: 1em;
    margin-bottom: 1em;
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

    ${_atrules.mobileUp} {
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
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;
    color: inherit;

    ::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      border-top-right-radius: var(--right-radius, 0.125rem);
      border-bottom-right-radius: var(--right-radius, 0.125rem);
      border-top-left-radius: var(--left-radius, 0.125rem);
      border-bottom-left-radius: var(--left-radius, 0.125rem);
    }
  `
}
