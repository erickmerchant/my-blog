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
    height: 100%;
    font-family: "Public Sans", system-ui, sans-serif;
    font-size: max(20px, 1vw);
    font-weight: ${fontWeights.normal};
    line-height: 1.5;
    color: hsl(100, 10%, 20%);
    background-color: #fff;

    --code-c: hsl(100, 35%, 70%);
    --code-bg: hsl(100, 10%, 20%);
    --code-b: var(--code-bg);
    --code-inline-c: hsl(100, 35%, 35%);
    --pg-disabled-bg: hsl(100, 10%, 35%);
    --pg-disabled-b-c: var(--pg-disabled-bg);
    --pg-disabled-c: #fff;
    --pg-enabled-hover-bg: hsl(100, 50%, 35%);
    --pg-enabled-hover-b-c: var(--pg-enabled-hover-bg);
    --pg-enabled-bg: hsl(100, 35%, 35%);
    --pg-enabled-b-c: var(--pg-enabled-bg);
    --pg-enabled-c: #fff;
    --hero-bg: hsla(100, 35%, 40%, 0.9);
    --hero-b: var(--hero-bg);
    --ftr-bg: hsl(100, 10%, 95%);
    --ftr-zz:
      linear-gradient(-135deg, #fff 0.5em, transparent 0),
      linear-gradient(135deg, #fff 0.5em, hsl(100, 10%, 95%) 0);
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
      --code-inline-c: hsl(100, 40%, 70%);
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
        linear-gradient(135deg, hsl(100, 10%, 20%) 25%, transparent 25%),
        linear-gradient(225deg, hsl(100, 10%, 20%) 25%, transparent 25%),
        linear-gradient(315deg, hsl(100, 10%, 20%) 25%, transparent 25%),
        linear-gradient(45deg, hsl(100, 10%, 20%) 25%, transparent 25%),
        linear-gradient(0deg, hsl(100, 30%, 70%) 0, hsl(100, 30%, 70%));
      --ftr-zz-posi: -0.25em 0, -0.25em 0, 0 0, 0 0;
      --ftr-zz-size: 0.5em 0.5em;
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

  font-size: 1.5em;
  font-weight: ${fontWeights.heading1};

  ${_atrules.desktopUp} {
    margin-top: 2em;
  }
`

const code = `
  font-family: Consolas, monaco, monospace;
  font-size: 0.875em;
  color: var(--code-c);
`

const paginationItemDisabled = `
  position: relative;
  padding-top: 1em;
  padding-bottom: 1em;
  font-weight: ${fontWeights.bold};
  background-color: var(--pg-disabled-bg);
  border: 3px solid var(--border-color);
  color: var(--pg-disabled-c);
  font-size: 0.875em;
  border-top-right-radius: var(--right-radius, 0.125em);
  border-bottom-right-radius: var(--right-radius, 0.125em);
  border-top-left-radius: var(--left-radius, 0.125em);
  border-bottom-left-radius: var(--left-radius, 0.125em);

  --border-color: var(--pg-disabled-b-c);

  ${_atrules.veryMobileDown} {
    --left-radius: 0.125em;
    --right-radius: 0.125em;
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
  --right-radius: 1.5em 50%;

  ${_atrules.mobileUp} {
    --left-radius: 1.5em 50%;
  }
`

const paginationItemOlder = `
  --left-radius: 1.5em 50%;

  ${_atrules.mobileUp} {
    --right-radius: 1.5em 50%;
  }
`

const main = `
  opacity: 1;
  transition: opacity 0.3s;
  font-weight: ${fontWeights.normal};
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

    ${_atrules.desktopUp} {
      grid-template-columns: 1fr 2fr;
      grid-template-rows: 1fr max-content;
    }
  `,
  hero: `
    display: contents;

    ${_atrules.desktopUp} {
      grid-row: 1 / -1;
      background-color: var(--hero-bg);
      border-right: 3px solid var(--hero-b);
      color: #fff;
      position: sticky;
      top: 0;
      height: 100vh;
      display: grid;
      justify-content: center;
      grid-auto-rows: 1fr;
      grid-template-columns: 90%;
      overflow-y: scroll;
    }
  `,
  headerAnchor: `
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;
    color: inherit;
  `,
  header: `
    padding-top: 1em;
    padding-bottom: 1em;
    background-color: var(--hero-bg);
    border-bottom: 3px solid var(--hero-b);
    font-weight: ${fontWeights.heading2};
    color: #fff;
    display: flex;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 1;

    ${_atrules.desktopUp} {
      ${heading}

      font-weight: ${fontWeights.heading1};
      background-color: transparent;
      border-bottom: none;
      justify-content: start;
      font-size: 1.5em;
      padding-top: 0;
      margin-top: 2em;
      position: relative;
      max-width: max-content;
    }
  `,
  footer: `
    background-color: var(--ftr-bg);
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25em;
    width: 100%;
    border-top: var(--mid-b);
    color: var(--ftr-c);

    ${_atrules.desktopUp} {
      padding-top: 1em;
      padding-right: 0;
      padding-left: 0;
      margin-top: 2em;
      margin-left: auto;
      margin-right: auto;
      background-image: var(--ftr-zz);
      background-color: var(--ftr-bg);
      background-position: var(--ftr-zz-posi, left top);
      background-repeat: repeat-x;
      background-size: var(--ftr-zz-size, 1em 1em);
      border-top: none;
    }
  `,
  footerList: `
    font-weight: ${fontWeights.bold};
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
    }
  `,
  footerItem: `
    margin-right: 0.5rem;
    margin-left: 0.5rem;
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
    background-color: var(--ftr-bg);
    background-image: var(--ftr-zz);
    background-position: var(--ftr-zz-posi, left top);
    background-size: var(--ftr-zz-size, 1em 1em);
    background-repeat: repeat-x;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 1em;
    color: var(--ftr-c);

    ${_atrules.desktopUp} {
      grid-row: 2;
      background-color: transparent;
      color: inherit;
      background-image: none;
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
    font-size: 0.875em;
    font-weight: ${fontWeights.normal};

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
    overflow: auto;
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    white-space: pre-wrap;
    word-break: break-word;
    background-color: var(--code-bg);
    max-width: 32rem;
    width: 100%;

    ${_atrules.mobileUp} {
      border-radius: 0.125em;
      border: 1px solid var(--code-b);
      margin-right: auto;
      margin-left: auto;
      padding-right: 1rem;
      padding-left: 1rem;
    }

    ${_atrules.desktopUp} {
      max-width: 100%;
      width: auto;
      margin-right: 2rem;
      margin-left: 2rem;
    }
  `,
  codeInline: `
    font-family: Consolas, monaco, monospace;
    font-size: 0.875em;
    color: var(--code-inline-c);
    word-break: break-word;

    ::before,
    ::after {
      content: "\`";
    }
  `,
  codeBlock: `
    ${code}
  `,
  anchor: `
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
    font-weight: ${fontWeights.semibold};
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
      margin-right: 0.5em;
      content: '-';
      color: currentColor;
      font-weight: ${fontWeights.bold};
    }
  `,
  paragraph: `
    ${mainItem}

    margin-top: 1em;
    margin-bottom: 1em;
  `,
  date: `
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-weight: ${fontWeights.semibold};
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
      padding-right: 0.0625em;
      padding-left: 0.0625em;
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
    grid-template-columns: repeat(auto-fit, minmax(7em, 1fr));
    text-align: center;
    list-style: none;
    padding-right: 0.5em;
    padding-left: 0.5em;
    gap: 0.0625em;

    ${_atrules.mobileUp} {
      gap: 0.5em;
    }

    ${_atrules.veryMobileDown} {
      padding-right: 0.125em;
      padding-left: 0.125em;
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
      border-top-right-radius: var(--right-radius, 0.125em);
      border-bottom-right-radius: var(--right-radius, 0.125em);
      border-top-left-radius: var(--left-radius, 0.125em);
      border-bottom-left-radius: var(--left-radius, 0.125em);
    }
  `
}
