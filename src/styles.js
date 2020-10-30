const fontWeights = {
  heading1: 900,
  heading2: 800,
  bold: 600,
  normal: 200
}

const colors = {
  green1: 'hsl(100, 30%, 50%)',
  green2: 'hsl(100, 40%, 60%)',
  green3: 'hsl(100, 50%, 70%)',
  gray1: 'hsl(100, 10%, 90%)',
  gray2: 'hsl(100, 10%, 80%)',
  gray3: 'hsl(100, 10%, 60%)',
  gray4: 'hsl(100, 10%, 20%)'
}

const borderRadius = '3px'

const tabletUp = '@media (min-width: 1024px)'
const mobileUp = '@media (min-width: 641px) and (max-width: 1023px)'

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
  }

  html {
    height: 100%;
    font-family: "Public Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
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
  font-weight: ${fontWeights.heading1};

  ${tabletUp} {
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
  border-radius: ${borderRadius};
  font-weight: ${fontWeights.bold};
  background-color: ${colors.gray3};
  font-size: 0.875em;
`

const paginationItemEnabled = `
  ${paginationItemDisabled}

  background-color: ${colors.green2};

  :focus, :hover {
    filter: saturate(1.5);
  }
`

const main = `
  opacity: 1;
  transition: opacity 0.3s;

  ${tabletUp} {
    grid-column: 2;
  }
`

const mainBlockLevelItem = `
  max-width: 31em;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
  margin-right: auto;
  margin-left: auto;

  ${tabletUp} {
    max-width: 34em;
    padding-right: 2rem;
    padding-left: 2rem;
    margin-right: 0;
    margin-left: 0;
  }
`

const withDivider = `
  ::before {
    content: '';
    display: block;
    height: 1px;
    background-color: ${colors.gray2};
    width: 80%;
    margin: 0 auto;
  }
`

export const classes = {
  app: `
    display: grid;
    min-height: 100%;
    grid-template-columns: 100%;
    grid-template-rows: max-content auto max-content max-content;

    ${tabletUp} {
      grid-template-columns: 1fr 2fr;
      grid-template-rows: 1fr max-content;
    }
  `,
  heading1,
  headerAnchor: `
    color: white;
    font-weight: ${fontWeights.bold};
  `,
  main,
  mainTransitioning: `
    ${main}

    opacity: 0;
    transition: none;
  `,
  mainHeader: `
    ${mainBlockLevelItem}
  `,
  mainHeading2: `
    ${mainBlockLevelItem}

    ${heading}

    font-weight: ${fontWeights.heading2};
  `,
  mainStrong: `
    font-weight: ${fontWeights.bold};
  `,
  mainPre: `
    overflow: auto;
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 1rem;
    padding-left: 1rem;
    white-space: pre-wrap;
    word-break: break-word;
    background-color: ${colors.gray4};
    max-width: 32em;
    width: 100%;

    ${mobileUp} {
      border-radius: ${borderRadius};
      margin-right: auto;
      margin-left: auto;
    }

    ${tabletUp} {
      border-radius: ${borderRadius};
      max-width: 100%;
      width: auto;
      margin-right: 2rem;
      margin-left: 2rem;
    }
  `,
  mainCodeInline: `
    ${code}

    font-weight: bold;
    color: ${colors.green1};
    word-break: break-word;

    ::before,
    ::after {
      content: "\`";
    }
  `,
  mainCodeBlock: `
    ${code}
  `,
  mainAnchor: `
    color: ${colors.green1};
  `,
  mainList: `
    ${mainBlockLevelItem}

    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 0.5rem;
    list-style: none;
  `,
  mainListItem: `
    :before {
      content: '-';
      margin-right: 0.5rem;
      font-weight: ${fontWeights.bold};
    }
  `,
  mainParagraph: `
    ${mainBlockLevelItem}

    margin-top: 1em;
    margin-bottom: 1em;
  `,
  date: `
    display: grid;
    grid-template-columns: max-content 1fr;
    align-items: center;
    font-weight: ${fontWeights.bold};
  `,
  dateIcon: `
    height: 0.8em;
    margin-right: 0.25rem;
  `,
  dateIconPart: `
    fill: ${colors.gray4};
  `,
  pagination: `
    ${mainBlockLevelItem}

    margin-top: 2em;
    margin-bottom: 2em;
  `,
  paginationList: `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(7em, 1fr));
    gap: 1em;
    color: white;
    text-align: center;
    list-style: none;
  `,
  paginationItemDisabled,
  paginationItemEnabled,
  paginationAnchor: `
    color: white;

    ::after {
      content: '';
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      border-radius: ${borderRadius};
    }
  `,
  hero: `
    display: contents;

    ${tabletUp} {
      display: block;
      grid-row: 1 / -1;
      background-color: ${colors.green1};
      color: white;
    }
  `,
  heroInner: `
    display: contents;

    ${tabletUp} {
      max-width: 34em;
      padding-right: 2rem;
      padding-left: 2rem;
      position: sticky;
      top: 0;
      height: 100vh;
      display: grid;
      grid-template-rows: 1fr 1fr;
    }
  `,
  header: `
    font-weight: ${fontWeights.heading1};
    padding-top: 1em;
    padding-bottom: 1em;
    background-color: ${colors.green1};
    color: white;
    display: grid;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 1;
    opacity: 0.9;

    ${tabletUp} {
      ${heading}

      display: block;
      font-size: 1.5em;
      padding-top: 0;
      opacity: 1;
      margin-top: 2em;
    }
  `,
  aboutContent: `
    grid-row: 3;
    padding-bottom: 1em;

    ${tabletUp} {
      grid-row: 2;
      background-color: inherit;
      color: inherit;
      font-size: 1em;
      padding-bottom: 0;
    }
  `,
  aboutContentInner: `
    max-width: 31em;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    margin-right: auto;
    margin-left: auto;

    ${withDivider}

    ${tabletUp} {
      display: contents;

      ::before {
        display: none;
      }
    }
  `,
  aboutHeading: `
    ${heading}

    font-weight: ${fontWeights.bold};
  `,
  aboutAnchor: `
    color: ${colors.green1};

    ${tabletUp} {
      color: white;
    }
  `,
  aboutParagraph: `
    font-size: 0.875em;
  `,
  aboutStrong: `
    font-weight: ${fontWeights.bold};
  `,
  footer: `
    background-color: ${colors.gray1};
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    width: 100%;

    ${tabletUp} {
      max-width: 34em;
      background-color: white;
      grid-column: 2;
      padding-right: 2rem;
      padding-left: 2rem;

      ${withDivider}
    }
  `,
  footerList: `
    display: grid;
    justify-content: center;
    grid-auto-flow: column;
    font-weight: ${fontWeights.bold};
    padding-top: 1em;
    padding-bottom: 1em;
    max-width: 31em;
    margin-right: auto;
    margin-left: auto;
    list-style: none;
    font-size: 0.75em;

    ${tabletUp} {
      max-width: 100%;
    }
  `,
  footerItem: `
    margin-right: 0.5rem;
    margin-left: 0.5rem;
  `,
  footerAnchor: `
    color: ${colors.green1};
  `
}
