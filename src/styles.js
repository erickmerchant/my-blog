const fontWeights = {
  heading1: 900,
  heading2: 700,
  bold: 500,
  semibold: 300,
  normal: 100
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
    color: var(--main-color);
    background-color: var(--main-background-color);

    --main-color: hsl(100, 10%, 20%);
    --main-background-color: #fff;
    --code-color: hsl(100, 35%, 70%);
    --code-background-color: hsl(100, 10%, 20%);
    --pagination-disabled-background-color: hsl(100, 10%, 60%);
    --pagination-disabled-color: #fff;
    --pagination-enabled-background-color: hsl(100, 35%, 60%);
    --pagination-enabled-color: #fff;
    --hero-background-color: hsl(100, 35%, 50%);
    --hero-border-color: hsl(100, 35%, 50%);
    --footer-background-color: hsl(100, 10%, 95%);
    --footer-mid-border: 1px solid hsl(100, 10%, 90%);
    --footer-top-background-image:
      linear-gradient(-135deg, var(--main-background-color) 0.5em, transparent 0),
      linear-gradient(135deg,  var(--main-background-color) 0.5em, var(--footer-background-color) 0);
    --footer-color: hsl(100, 10%, 20%);
    --anchor-color: hsl(100, 35%, 50%);
    --code-inline-color: hsl(100, 35%, 50%);
    --date-fill: hsl(100, 10%, 20%);
  }

  @media (prefers-color-scheme: dark) {
    html {
      --main-color: #fff;
      --main-background-color: hsl(100, 10%, 20%);
      --code-color: hsl(100, 60%, 70%);
      --code-background-color: hsl(100, 10%, 25%);
      --pagination-disabled-background-color: transparent;
      --pagination-disabled-color: hsl(100, 10%, 70%);
      --pagination-enabled-background-color: transparent;
      --pagination-enabled-color: hsl(100, 50%, 70%);
      --hero-background-color: hsl(100, 20%, 20%);
      --hero-border-color: hsl(100, 50%, 70%);
      --footer-background-color: hsl(100, 10%, 20%);
      --footer-mid-border: 1px dashed #fff;
      --footer-top-background-image:
        linear-gradient(135deg, hsl(100, 10%, 20%) 25%, transparent 25%),
        linear-gradient(225deg, hsl(100, 10%, 20%) 25%, transparent 25%),
        linear-gradient(315deg, hsl(100, 10%, 20%) 25%, transparent 25%),
        linear-gradient(45deg, hsl(100, 10%, 20%) 25%, transparent 25%),
        linear-gradient(0deg, hsl(100, 50%, 70%) 0, hsl(100, 50%, 70%) 100%);
      --footer-top-background-position: -0.25em 0, -0.25em 0, 0 0, 0 0;
      --footer-top-background-size: 0.5em 0.5em;
      --footer-color: #fff;
      --anchor-color: hsl(100, 50%, 70%);
      --code-inline-color: hsl(100, 50%, 70%);
      --date-fill: hsl(100, 50%, 70%);
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

  @media (min-width: 1024px) {
    margin-top: 2em;
  }
`

const code = `
  font-family: Consolas, monaco, monospace;
  font-size: 0.875em;
  color: var(--code-color);
`

const paginationItemDisabled = `
  position: relative;
  padding-top: 1em;
  padding-bottom: 1em;
  font-weight: ${fontWeights.bold};
  background-color: var(--pagination-disabled-background-color);
  border: 3px solid currentColor;
  color: var(--pagination-disabled-color);
  font-size: 0.875em;
  border-top-right-radius: var(--right-radius, 0.125em);
  border-bottom-right-radius: var(--right-radius, 0.125em);
  border-top-left-radius: var(--left-radius, 0.125em);
  border-bottom-left-radius: var(--left-radius, 0.125em);

  @media (max-width: 320px) {
    --left-radius: 0.125em;
    --right-radius: 0.125em;
  }
`

const paginationItemEnabled = `
  ${paginationItemDisabled}

  background-color: var(--pagination-enabled-background-color);
  color: var(--pagination-enabled-color);

  :focus, :hover {
    filter: saturate(1.5);
  }
`

const paginationItemNewer = `
  --right-radius: 1.5em 50%;

  @media (min-width: 641px) {
    --left-radius: 1.5em 50%;
  }
`

const paginationItemOlder = `
  --left-radius: 1.5em 50%;

  @media (min-width: 641px) {
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

  @media (min-width: 1024px) {
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

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 2fr;
      grid-template-rows: 1fr max-content;
    }
  `,
  hero: `
    display: contents;

    @media (min-width: 1024px) {
      grid-row: 1 / -1;
      background-color: var(--hero-background-color);
      border-right: 3px solid var(--hero-border-color);
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
    background-color: var(--hero-background-color);
    border-bottom: 3px solid var(--hero-border-color);
    font-weight: ${fontWeights.heading2};
    color: #fff;
    display: flex;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 1;
    opacity: 0.9;

    @media (min-width: 1024px) {
      ${heading}

      font-weight: ${fontWeights.heading1};
      background-color: transparent;
      border-bottom: none;
      justify-content: start;
      font-size: 1.5em;
      padding-top: 0;
      opacity: 1;
      margin-top: 2em;
      position: relative;
      max-width: max-content;
    }
  `,
  footer: `
    background-color: var(--footer-background-color);
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25em;
    width: 100%;
    border-top: var(--footer-mid-border);
    color: var(--footer-color);

    @media (min-width: 1024px) {
      padding-top: 1em;
      padding-right: 0;
      padding-left: 0;
      margin-top: 2em;
      margin-left: auto;
      margin-right: auto;
      background-image: var(--footer-top-background-image);
      background-color: var(--footer-background-color);
      background-position: var(--footer-top-background-position, left top);
      background-repeat: repeat-x;
      background-size: var(--footer-top-background-size, 1em 1em);
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

    @media (min-width: 1024px) {
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
    color: var(--anchor-color);
  `
}

export const aboutClasses = {
  about: `
    grid-row: 3;
    margin-top: 2em;
    background-color: var(--footer-background-color);
    background-image: var(--footer-top-background-image);
    background-position: var(--footer-top-background-position, left top);
    background-repeat: repeat-x;
    background-size: var(--footer-top-background-size, 1em 1em);
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 1em;
    color: var(--footer-color);

    @media (min-width: 1024px) {
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

    @media (max-width: 1023px) {
      max-width: 30rem;
      margin-right: auto;
      margin-left: auto;
    }
  `,
  anchor: `
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.1875em;
    color: var(--anchor-color);

    @media (min-width: 1024px) {
      color: var(--header-color);
    }
  `,
  paragraph: `
    font-size: 0.875em;
    font-weight: ${fontWeights.normal};

    @media (max-width: 1023px) {
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
    background-color: var(--code-background-color);
    max-width: 32rem;
    width: 100%;

    @media (min-width: 641px) {
      border-radius: 0.125em;
      margin-right: auto;
      margin-left: auto;
      padding-right: 1rem;
      padding-left: 1rem;
    }

    @media (min-width: 1024px) {
      max-width: 100%;
      width: auto;
      margin-right: 2rem;
      margin-left: 2rem;
    }
  `,
  codeInline: `
    color: var(--code-inline-color);
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
    color: var(--anchor-color);
  `,
  list: `
    ${mainItem}

    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 0.5rem;
    list-style: none;
  `,
  listItem: `
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
    fill: var(--date-fill);
  `,
  pagination: `
    ${mainItem}

    margin-top: 2em;

    @media (max-width: 320px) {
      padding-right: 0.0625em;
      padding-left: 0.0625em;
    }

    @media (min-width: 1024px) {
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

    @media (min-width: 641px) {
      gap: 0.5em;
    }

    @media (max-width: 320px) {
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
