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

  ${tabletUp} {
    margin-top: 2em;
  }
`

const codeBlock = `
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
  max-width: 31em;
  padding-right: 0.5em;
  padding-left: 0.5em;
  margin-right: auto;
  margin-left: auto;
  opacity: 1;
  transition: opacity 0.3s;

  ${tabletUp} {
    max-width: 34em;
    padding-right: 2em;
    padding-left: 2em;
    grid-column: 2;
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
  heading1: `
    ${heading}

    font-size: 1.5em;
    font-weight: ${fontWeights.heading1};
  `,
  heading2: `
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
    padding-right: 1em;
    padding-left: 1em;
    white-space: pre-wrap;
    word-break: break-word;
    background-color: ${colors.gray4};
    border-radius: ${borderRadius};
  `,
  code: `
    ${codeBlock}

    font-weight: bold;
    color: ${colors.green1};
    word-break: break-word;

    ::before,
    ::after {
      content: "\`";
    }
  `,
  codeBlock,
  anchor: `
    color: ${colors.green1};
  `,
  list: `
    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 0.5em;
    list-style: none;
  `,
  listItem: `
    :before {
      content: '-';
      margin-right: 0.5em;
      font-weight: ${fontWeights.bold};
    }
  `,
  paragraph: `
    margin-top: 1em;
    margin-bottom: 1em;
  `,
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
  date: `
    display: grid;
    grid-template-columns: max-content 1fr;
    align-items: center;
    font-weight: ${fontWeights.bold};
  `,
  dateIcon: `
    height: 0.8em;
    margin-right: 0.25em;
  `,
  dateIconContainer: `
    fill: ${colors.gray4};
  `,
  pagination: `
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
      padding-right: 2em;
      padding-left: 2em;
      position: sticky;
      top: 0;
      height: 100vh;
      display: grid;
      grid-template-rows: 1fr 1fr;
      overflow-y: scroll;
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
    padding-right: 0.5em;
    padding-left: 0.5em;
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
  footer: `
    background-color: ${colors.gray1};
    padding-right: 0.5em;
    padding-left: 0.5em;
    width: 100%;

    ${tabletUp} {
      max-width: 34em;
      background-color: white;
      grid-column: 2;
      padding-right: 2em;
      padding-left: 2em;

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
    margin-right: 0.5em;
    margin-left: 0.5em;
  `,
  footerAnchor: `
    color: ${colors.green1};
  `
}
