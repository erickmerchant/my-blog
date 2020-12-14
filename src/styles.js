const fontWeights = {
  heading: 900,
  bold: 500,
  normal: 100
}

const colors = {
  green1: 'hsl(100, 30%, 50%)',
  green2: 'hsl(100, 40%, 60%)',
  green3: 'hsl(100, 50%, 70%)',
  gray1: 'hsl(100, 10%, 95%)',
  gray2: 'hsl(100, 10%, 80%)',
  gray3: 'hsl(100, 10%, 60%)',
  gray4: 'hsl(100, 10%, 20%)'
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
    color: ${colors.gray4};
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
  font-weight: ${fontWeights.heading};

  @media (min-width: 1024px) {
    margin-top: 2em;
  }
`

const code = `
  font-family: Consolas, monaco, monospace;
  font-size: 0.875em;
  color: ${colors.green3};
`

const paginationItemDisabled = `
  position: relative;
  padding-top: 1em;
  padding-bottom: 1em;
  font-weight: ${fontWeights.bold};
  background-color: ${colors.gray3};
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

  background-color: ${colors.green2};

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

const mainBlockLevelItemMobile = `
  max-width: 31rem;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  margin-right: auto;
  margin-left: auto;
`

const mainBlockLevelItemDesktop = `
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
      display: block;
      grid-row: 1 / -1;
      background-color: ${colors.green1};
      color: #fff;
    }
  `,
  heroInner: `
    display: contents;

    @media (min-width: 1024px) {
      max-width: 34rem;
      padding-right: 2rem;
      padding-left: 2rem;
      position: sticky;
      top: 0;
      height: 100vh;
      display: grid;
      grid-auto-rows: 1fr;
    }
  `,
  headerAnchor: `
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;
    color: #fff;
  `,
  header: `
    padding-top: 1em;
    padding-bottom: 1em;
    background-color: ${colors.green1};
    font-weight: ${fontWeights.bold + 100};
    color: #fff;
    display: grid;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 1;
    opacity: 0.9;

    @media (min-width: 1024px) {
      ${heading}

      font-weight: ${fontWeights.bold + 200};
      background-color: transparent;
      display: block;
      font-size: 1.5em;
      padding-top: 0;
      opacity: 1;
      margin-top: 2em;
    }
  `,
  footer: `
    background-color: ${colors.gray1};
    padding-top: 1em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.5em;
    width: 100%;
    display: grid;
    justify-content: center;
    justify-items: center;

    @media (min-width: 1024px) {
      padding-right: 0;
      padding-left: 0;
      margin-top: 2em;
      margin-left: auto;
      margin-right: auto;
      background-image:
        linear-gradient(-135deg, white 0.5em, transparent 0),
        linear-gradient(135deg,  white 0.5em, ${colors.gray1} 0);
      background-color: ${colors.gray1};
      background-position: left top;
      background-repeat: repeat-x;
      background-size: 1em 1em;
    }
  `,
  footerList: `
    display: grid;
    justify-content: center;
    grid-auto-flow: column;
    font-weight: ${fontWeights.bold};
    padding-top: 1em;
    padding-bottom: 1em;
    max-width: 31rem;
    margin-right: auto;
    margin-left: auto;
    list-style: none;
    font-size: 0.75em;

    @media (min-width: 1024px) {
      max-width: 100%;
    }
  `,
  footerItem: `
    max-width: 34rem;
    margin-right: 0.5rem;
    margin-left: 0.5rem;
  `,
  footerAnchor: `
    text-decoration-thickness: 0.125em;
    text-underline-offset: 0.125em;

    color: ${colors.green1};
  `
}

export const aboutClasses = {
  about: `
    grid-row: 3;
    margin-top: 2em;
    background-image:
      linear-gradient(-135deg, white 0.5em, transparent 0),
      linear-gradient(135deg,  white 0.5em, ${colors.gray1} 0);
    background-position: left top;
    background-repeat: repeat-x;
    background-size: 1em 1em;

    @media (min-width: 1024px) {
      grid-row: 2;
      background-color: inherit;
      color: inherit;
      padding-bottom: 0;
      background-image: none;
    }
  `,
  inner: `
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    background-color: ${colors.gray1};

    @media (min-width: 1024px) {
      display: contents;
      background-color: #fff;

      ::before {
        display: none;
      }
    }
  `,
  heading: `
    ${heading}

    font-weight: ${fontWeights.bold + 100};
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

    color: ${colors.green1};

    @media (min-width: 1024px) {
      color: #fff;
    }
  `,
  paragraph: `
    font-size: 0.875em;
    font-weight: ${fontWeights.normal + 100};

    @media (max-width: 1023px) {
      max-width: 30rem;
      margin-right: auto;
      margin-left: auto;
    }
  `,
  strong: `
    font-weight: ${fontWeights.bold};
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
    ${mainBlockLevelItemMobile}
    ${mainBlockLevelItemDesktop}
  `,
  heading2: `
    ${mainBlockLevelItemMobile}
    ${mainBlockLevelItemDesktop}

    ${heading}

    font-weight: ${fontWeights.bold + 100};
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
    background-color: ${colors.gray4};
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
    color: ${colors.green1};
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

    color: ${colors.green1};
  `,
  list: `
    ${mainBlockLevelItemMobile}
    ${mainBlockLevelItemDesktop}

    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 0.5rem;
    list-style: none;
  `,
  listItem: `
    margin-left: 0.5rem;
    text-indent: 0.25rem;

    ::marker {
      content: '-';
      font-weight: ${fontWeights.bold};
    }
  `,
  paragraph: `
    ${mainBlockLevelItemMobile}
    ${mainBlockLevelItemDesktop}

    margin-top: 1em;
    margin-bottom: 1em;
  `,
  date: `
    display: grid;
    grid-template-columns: max-content 1fr;
    align-items: center;
    font-weight: ${fontWeights.normal + 200};
  `,
  dateIcon: `
    height: 1em;
    margin-right: 0.3rem;
  `,
  dateIconPart: `
    fill: ${colors.gray4};
  `,
  pagination: `
    ${mainBlockLevelItemMobile}

    margin-top: 2em;

    @media (max-width: 320px) {
      padding-right: 0.0625em;
      padding-left: 0.0625em;
    }

    ${mainBlockLevelItemDesktop}

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
    gap: 0.125em;
    color: #fff;
    text-align: center;
    list-style: none;

    @media (min-width: 641px) {
      gap: 1em;
    }

    @media (max-width: 320px) {
      gap: 0.0625em;
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

    color: #fff;

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
