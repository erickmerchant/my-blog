const fontWeights = {
  heading1: 900,
  heading2: 800,
  bold: 600,
  normal: 200
}

const colors = {
  green1: 'hsl(100, 30%, 50%)',
  green2: 'hsl(100, 50%, 70%)',
  lightGray: 'hsl(100, 5%, 95%)',
  gray: 'hsl(100, 5%, 50%)',
  darkGray: 'hsl(100, 5%, 20%)'
}

const borderRadius = '3px'

const paddingX = 'max(10px, 2vw)'

const tabletUp = '@media (min-width: 768px)'

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

export const styles = {
  app: `
    display: grid;
    min-height: 100%;
    font-size: max(20px, 1vw);
    font-weight: ${fontWeights.normal};
    line-height: 1.5;
    color: ${colors.darkGray};
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
    background-color: ${colors.darkGray};
    border-radius: ${borderRadius};
  `,
  code: (styles) => `
    ${styles.codeBlock}

    font-weight: bold;
    color: ${colors.green1};
    word-break: break-word;

    ::before,
    ::after {
      content: "\`";
    }
  `,
  codeBlock: `
    font-family: Consolas, monaco, monospace;
    font-size: 0.875em;
    color: ${colors.green2};
  `,
  anchor: `
    box-shadow: 0 0.1em 0 0 currentcolor;
    color: ${colors.green1};
    text-decoration: none;

    :hover {
      text-decoration: none;
    }
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
  header: `
    padding-top: 1em;
    padding-bottom: 1em;
    background-color: ${colors.green1};
    color: white;
    display: grid;
    justify-content: center;
    position: sticky;
    top: 0;
    z-index: 1;

    ${tabletUp} {
      display: none;
    }
  `,
  headerAnchor: `
    color: white;
    font-weight: ${fontWeights.bold};
  `,
  main: `
    max-width: calc(30em + (${paddingX} * 2));
    padding-right: ${paddingX};
    padding-left: ${paddingX};
    margin-right: auto;
    margin-left: auto;

    ${tabletUp} {
      grid-column: 2;
    }
  `,
  date: `
    display: grid;
    grid-template-columns: max-content 1fr;
    align-items: center;
    font-weight: ${fontWeights.bold};
  `,
  dateIcon: `
    height: 0.95em;
    margin-top: 0.05em;
    margin-right: 0.25em;
    fill: currentcolor;
  `,
  paginationList: `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10em, 1fr));
    gap: 1em;
    padding-top: 1em;
    margin-bottom: 2em;
    color: white;
    text-align: center;
    list-style: none;
  `,
  paginationItemDisabled: `
    position: relative;
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 3em;
    padding-left: 3em;
    border-radius: ${borderRadius};
    font-weight: ${fontWeights.bold};
    background-color: ${colors.gray};
    font-size: 0.875em;
  `,
  paginationItemEnabled: (styles) => `
    ${styles.paginationItemDisabled}

    background-color: ${colors.green1};

    :focus, :hover {
      filter: saturate(1.5);
    }
  `,
  paginationAnchor: (styles) => `
    ${styles.anchor}

    color: white;

    ::after {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      border-radius: ${borderRadius};
    }
  `,
  aside: `
    background-color: ${colors.lightGray};
    color: ${colors.darkGray};

    ${tabletUp} {
      grid-row: 1 / -1;
      background-color: ${colors.green1};
      color: white;
    }
  `,
  asideInner: `
    padding-right: ${paddingX};
    padding-left: ${paddingX};
    max-width: calc(30em + (${paddingX} * 2));
    margin-left: auto;
    margin-right: auto;

    ${tabletUp} {
      position: sticky;
      top: 0;
      height: 100vh;
      display: grid;
      gird-template: 1fr 1fr;
      overflow-y: scroll;
    }
  `,
  asideHeader: `
    ${heading}

    display: none;
    font-size: 1.5em;
    font-weight: ${fontWeights.heading1};

    ${tabletUp} {
      display: block;
    }
  `,
  aboutContent: `
    padding-bottom: 1em;
  `,
  aboutHeading: `
    ${heading}

    margin-top: 1em;
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
    background-color: ${colors.lightGray};
    color: ${colors.darkGray};
    font-size: 0.875em;

    ${tabletUp} {
      background-color: white;
      color: ${colors.darkGray};
      grid-column: 2;
    }
  `,
  footerNav: `
    display: grid;
    justify-content: center;
    font-weight: ${fontWeights.bold};
    border-top: 1px solid ${colors.gray};
    padding-top: 1em;
    padding-bottom: 1em;
    margin-right: 3em;
    margin-left: 3em;

    ${tabletUp} {
      border-color: ${colors.lightGray};
    }
  `,
  footerNavList: `
    list-style: none;
    text-align: center;
  `,
  footerNavItem: `
    display: inline-block;
    margin-right: 0.5em;
    margin-left: 0.5em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  `,
  footerNavAnchor: `
    color: ${colors.green1};
  `
}
