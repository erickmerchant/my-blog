const fontWeights = {
  heading1: 900,
  heading2: 800,
  bold: 600,
  normal: 200
}

const colors = {
  green1: 'hsl(100, 30%, 50%)',
  green2: 'hsl(100, 50%, 70%)',
  gray: 'hsl(100, 5%, 50%)',
  black: 'hsl(100, 5%, 15%)'
}

const borderRadius = '0.25em'

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
  margin-bottom: 0.5em;
  margin-top: 2em;
  line-height: 1.25;
`

const button = `
  margin: 1em;
  position: relative;
  flex: 1 1 calc(50% - 2em);
  padding: 1em 3em;
  border-radius: ${borderRadius};
  background-color: ${colors.green1};
  font-weight: ${fontWeights.bold};
`

export const styles = {
  app: `
    display: grid;
    grid-template-rows: max-content 1fr max-content;
    height: 100%;
    font-size: max(20px, 1vw);
    font-weight: ${fontWeights.normal};
    line-height: 1.5;
    color: ${colors.black};
  `,
  topNav: `
    font-weight: ${fontWeights.bold};
    background-color: ${colors.green1};
  `,
  topNavList: (styles) => `
    ${styles.navList}

    justify-content: center;
  `,
  heading1: `
    ${heading}

    font-size: 1.5em;
    font-weight: ${fontWeights.heading1};
  `,
  heading2: `
    ${heading}

    font-size: 1em;
    font-weight: ${fontWeights.heading2};
  `,
  strong: `
    font-weight: ${fontWeights.bold};
  `,
  pre: `
    overflow: auto;
    padding: 1em;
    white-space: pre-wrap;
    background-color: ${colors.black};
    border-radius: ${borderRadius};
  `,
  code: (styles) => `
    ${styles.codeBlock}

    font-weight: bold;
    color: ${colors.green1};

    ::before,
    ::after {
      content: "\`";
    }
  `,
  codeBlock: `
    font-family: Consolas, monaco, monospace;
    font-size: .8em;
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
  main: `
    width: min(40em, 100%);
    margin-right: auto;
    margin-left: auto;
    padding-right: 1em;
    padding-left: 1em;
  `,
  navList: `
    display: flex;
    flex-wrap: wrap;
    padding-top: 1em;
    padding-bottom: 1em;
    color: white;
    text-align: center;
    list-style: none;
  `,
  navListItem: `
    margin: 1em;
  `,
  navAnchor: (styles) => `
    ${styles.anchor}

    color: white;
  `,
  buttonEnabled: `
    ${button}

    :focus, :hover {
      filter: saturate(1.5);
    }
  `,
  buttonDisabled: `
    ${button}

    background-color: ${colors.gray};
  `,
  buttonAnchor: (styles) => `
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
  footer: `
    font-size: .75em;
    margin-top: 4em;
    background-color: ${colors.green1};
  `,
  footerList: (styles) => `
    ${styles.navList}

    justify-content: center;
    font-weight: ${fontWeights.bold};
  `
}
