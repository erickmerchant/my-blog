const fontWeights = {
  heading: 900,
  bold: 500,
  normal: 100
}

const colors = {
  green1: 'hsl(100, 35%, 50%)',
  green2: 'hsl(100, 35%, 60%)',
  green3: 'hsl(100, 35%, 70%)',
  gray1: 'hsl(100, 10%, 95%)',
  gray2: 'hsl(100, 10%, 90%)',
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
  flex: 1 1;
  margin: 0.0625em;

  @media (min-width: 641px) {
    margin: 0.5em;
  }

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
      background-color: ${colors.green1};
      color: #fff;
      padding-right: 2rem;
      padding-left: 2rem;
      position: sticky;
      top: 0;
      height: 100vh;
      display: grid;
      grid-auto-rows: 1fr;
      overflow-y: scroll;
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
    display: flex;
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
      position: relative;
    }
  `,
  footer: `
    background-color: ${colors.gray1};
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 0.25em;
    width: 100%;
    border-top: 1px solid ${colors.gray2};

    @media (min-width: 1024px) {
      padding-top: 1em;
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

    color: ${colors.green1};
  `
}

export const aboutClasses = {
  about: `
    grid-row: 3;
    margin-top: 2em;
    background-color: ${colors.gray1};
    background-image:
      linear-gradient(-135deg, white 0.5em, transparent 0),
      linear-gradient(135deg,  white 0.5em, ${colors.gray1} 0);
    background-position: left top;
    background-repeat: repeat-x;
    background-size: 1em 1em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    padding-bottom: 1em;

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
    ${mainItem}
  `,
  heading2: `
    ${mainItem}

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
    ${mainItem}

    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 0.5rem;
    list-style: none;
  `,
  listItem: `
    ::before {
      display: inline-block;
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
    display: flex;
    flex-wrap: wrap;
    color: #fff;
    text-align: center;
    list-style: none;
    padding-right: 0.5em;
    padding-left: 0.5em;

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
