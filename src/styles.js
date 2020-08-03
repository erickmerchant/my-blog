const fontWeights = {
  heading1: 900,
  heading2: 800,
  bold: 600,
  normal: 200
}

const colors = {
  green0: 'hsl(100, 25%, 45%)',
  green1: 'hsl(100, 35%, 55%)',
  green2: 'hsl(100, 50%, 70%)',
  lightGray: 'hsl(100, 5%, 95%)',
  gray: 'hsl(100, 5%, 50%)',
  darkGray: 'hsl(100, 5%, 25%)',
  black: 'hsl(100, 5%, 15%)'
}

const borderRadius = '0.25em'

const tablet = '@media (min-width: 768px)'
const desktop = '@media (min-width: 1024px)'

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

  ${tablet} {
    margin-top: 2em;
  }
`

export const styles = {
  app: `
    display: grid;
    height: 100%;
    font-size: max(20px, 1vw);
    font-weight: ${fontWeights.normal};
    line-height: 1.5;
    color: ${colors.black};
    grid-template-columns: 100%;
    grid-template-rows: max-content 1fr max-content max-content;

    --padding: 0.5em;

    ${tablet} {
      grid-template-columns: 1fr 2fr;
      grid-template-rows: max-content 1fr max-content;

      --padding: 1em;
    }

    ${desktop} {
      --padding: 2em;
    }
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
    word-break: break-word;
    background-color: ${colors.black};
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
    font-size: 0.75em;
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
    display: flex;
    justify-content: center;

    ${tablet} {
      display: none;
    }
  `,
  headerAnchor: `
    color: inherit;
    font-weight: ${fontWeights.bold};
  `,
  main: `
    width: min(40em, 100%);
    padding-right: var(--padding);
    padding-left: var(--padding);

    ${tablet} {
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
    display: flex;
    flex-wrap: wrap;
    padding-top: 1em;
    margin-bottom: 2em;
    color: white;
    text-align: center;
    list-style: none;
    flex-direction: column;

    ${tablet} {
      flex-direction: row;
    }
  `,
  paginationItemDisabled: `
    margin-top: 1em;
    position: relative;
    flex: 1 1;
    padding: 1em 3em;
    border-radius: ${borderRadius};
    font-weight: ${fontWeights.bold};
    background-color: ${colors.gray};

    ${tablet} {
      margin-right: 1em;

      :last-child {
        margin-right: 0;
      }
    }
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

    ${tablet} {
      grid-row: 1 / -1;
      background-color: ${colors.green0};
      color: white;
    }
  `,
  asideInner: `
    padding-right: var(--padding);
    padding-left: var(--padding);

    ${tablet} {
      position: sticky;
      top: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow-y: scroll;
    }
  `,
  asideHeader: `
    ${heading}

    display: none;
    font-size: 1.5em;
    font-weight: ${fontWeights.heading1};

    ${tablet} {
      display: block;
    }
  `,
  aboutContent: `
    padding-bottom: 1em;
  `,
  aboutHeading: `
    ${heading}

    font-weight: ${fontWeights.bold};
  `,
  aboutAnchor: `
    color: ${colors.green1};

    ${tablet} {
      color: inherit;
    }
  `,
  aboutParagraph: `
    font-size: 0.75em;
  `,
  footer: `
    background-color: ${colors.lightGray};
    color: ${colors.darkGray};
    font-size: 0.75em;

    ${tablet} {
      background-color: white;
      color: ${colors.black};
      grid-column: 2;
    }
  `,
  footerNavList: `
    display: flex;
    justify-content: center;
    list-style: none;
    display: flex;
    font-weight: ${fontWeights.bold};
    border-top: 1px solid ${colors.gray};
    padding: 1em 0;
    margin: 0 3em;

    ${tablet} {
      border-color: ${colors.lightGray};
    }
  `,
  footerNavItem: `
    margin: 0 0.5em;
  `,
  footerNavAnchor: `
    color: ${colors.green1};
  `
}
