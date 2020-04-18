const fontWeights = {
  h1: 900,
  h2: 775,
  h3: 650,
  h4: 525,
  h5: 400,
  h6: 275
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
    font-display: fallback;
    font-family: "Public Sans";
    font-style: normal;
    font-weight: 100 900;
    src: url("/fonts/Public_Sans/PublicSans-VariableFont_wght-subset.woff2") format("woff2");
  }

  * {
    box-sizing: border-box;
    font: inherit;
    margin: 0;
    padding: 0;
    max-width: 100%;
  }

  html {
    height: 100%;
    font-family: "Public Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  ::marker {
    color: currentColor;
  }
`

export const styles = {
  app: `
    font-size: max(20px, 1vw);
    line-height: 1.5;
    font-weight: ${fontWeights.h6};
    display: flex;
    height: 100%;
    flex-direction: column;
    color: ${colors.black};
  `,
  topNav: `
    font-weight: ${fontWeights.h4};
    background-color: ${colors.green1};
  `,
  topNavList: (styles) => `
    ${styles.navList}

    justify-content: center;
  `,
  heading: `
    line-height: 1.25;
    margin-bottom: 0.5em;
    margin-top: 1em;
  `,
  heading1: (styles) => `
    ${styles.heading}

    font-size: 1.5em;
    font-weight: ${fontWeights.h1};
  `,
  heading2: (styles) => `
    ${styles.heading}

    font-size: 1.25em;
    font-weight: ${fontWeights.h2};
  `,
  strong: `
    font-weight: ${fontWeights.h4};
  `,
  pre: `
    overflow: auto;
    padding: 1em;
    white-space: pre-wrap;
    color: ${colors.green2};
    background-color: ${colors.black};
    border-radius: ${borderRadius};
  `,
  code: (styles) => `
    ${styles.codeBlock}

    color: ${colors.green1};
    font-weight: bold;

    ::before,
    ::after {
      content: "\`";
    }
  `,
  codeBlock: `
    font-family: Consolas, monaco, monospace;
    font-weight: ${fontWeights.h5};
    font-size: .8em;
  `,
  anchor: `
    box-shadow: 0 0.1em 0 0 currentColor;
    color: ${colors.green1};
    text-decoration: none;

    :hover {
      text-decoration: none;
    }
  `,
  list: `
    margin-top: 1em;
    margin-bottom: 1em;
    padding-left: 2em;
    list-style: disc;
  `,
  paragraph: `
    margin-top: 1em;
    margin-bottom: 1em;
  `,
  date: `
    font-weight: ${fontWeights.h3};
    display: inline-flex;
    align-items: center;
  `,
  dateIcon: `
    height: 1em;
    margin-right: 0.5em;
    fill: currentColor;
  `,
  main: `
    flex: 1 1 auto;
    width: min(100%, 40em);
    margin-right: auto;
    margin-left: auto;
    padding-right: 1em;
    padding-left: 1em;
  `,
  navList: `
    display: flex;
    color: white;
    flex-wrap: wrap;
    text-align: center;
    padding-top: 1em;
    padding-bottom: 1em;
    list-style: none;
  `,
  navListItem: `
    margin: 1em;
  `,
  navAnchor: (styles) => `
    ${styles.anchor}

    color: white;
  `,
  button: (styles) => `
    ${styles.navListItem}

    position: relative;
    flex: 1 1 calc(50% - 2em);
    padding: 1em 3em;
    font-weight: ${fontWeights.h3};
    background-color: ${colors.green1};
    border-radius: ${borderRadius};
  `,
  buttonDisabled: (styles) => `
    ${styles.button(styles)}

    background-color: ${colors.gray};

    @media(max-width: 40em) {
      display: none;
    }
  `,
  buttonAnchor: (styles) => `
    ${styles.anchor}

    color: white;

    ::after {
      display: block;
      content: "";
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
    font-weight: ${fontWeights.h4};
  `
}
