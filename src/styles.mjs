const fontWeights = {
  h1: 900,
  h2: 775,
  h3: 650,
  h4: 525,
  h5: 400,
  h6: 275
}

const colors = {
  primary: 'hsl(120, 50%, 50%)',
  secondary: 'hsl(120, 25%, 50%)',
  neutral: 'hsl(120, 12.25%, 50%)',
  dim: 'hsl(120, 75%, 25%)',
  bright: 'hsl(120, 75%, 75%)',
  light: 'hsl(120, 50%, 75%)',
  dark: 'hsl(120, 50%, 12.25%)'
}

const borderRadius = '0.25em'

export const _start = `
  @font-face {
    font-display: fallback;
    font-family: "Public Sans";
    font-style: normal;
    font-weight: 1 999;
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
    font: 20px/1.5 "Public Sans", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-weight: ${fontWeights.h6};
  }

  h1,
  h2 {
    line-height: 1.25;
    margin-bottom: 0.5em;
    margin-top: 1em;
  }

  h1 {
    font-size: 1.5em;
    font-weight: ${fontWeights.h1};
  }

  h2 {
    font-size: 1.25em;
    font-weight: ${fontWeights.h2};
  }

  p,
  ul,
  pre {
    margin-top: var(--content-x-spacing, 0);
    margin-bottom: var(--content-x-spacing, 0);
  }

  ul {
    padding-left: var(--list-indent, 0);
    list-style: var(--list-style, none);
  }

  ::marker {
    color: currentColor;
  }

  a {
    box-shadow: 0 0.1em 0 0 currentColor;
    color: var(--link-color, ${colors.primary});
  }

  a,
  a:hover {
    text-decoration: none;
  }

  pre {
    overflow: auto;
    padding: 1em;
    white-space: pre-wrap;
    color: ${colors.bright};
    background-color: ${colors.dark};
    border-radius: ${borderRadius};
  }

  code {
    font-family: Consolas, monaco, monospace;
    font-weight: ${fontWeights.h5};
    font-size: .8em;
  }

  :not(pre) > code {
    color: ${colors.dim};
    font-weight: bold;
  }

  :not(pre) > code::before,
  :not(pre) > code::after {
    content: "\`";
  }
`

export const styles = {
  app: `
    display: flex;
    height: 100%;
    flex-direction: column;
    color: ${colors.dark};
  `,
  topNav: `
    font-weight: ${fontWeights.h4};
    background-color: ${colors.secondary};
  `,
  topNavList: (styles) => `
    ${styles.list}

    justify-content: center;
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
    width: 100%;
    max-width: 40em;
    margin-right: auto;
    margin-left: auto;
    padding-right: 1em;
    padding-left: 1em;
  `,
  content: `
    --list-indent: 2em;
    --content-x-spacing: 1em;
    --list-style: disc;
  `,
  list: `
    display: flex;
    color: white;
    flex-wrap: wrap;
    text-align: center;
    padding-top: 1em;
    padding-bottom: 1em;

    --link-color: currentColor;
  `,
  listItem: `
    margin: 1em;
  `,
  button: (styles) => `
    ${styles.listItem}

    position: relative;
    flex: 1 1 calc(50% - 2em);
    padding: 1em 3em;
    font-weight: ${fontWeights.h3};
    background-color: ${colors.primary};
    border-radius: ${borderRadius};
  `,
  buttonDisabled: (styles) => `
    ${styles.button(styles)}

    background-color: ${colors.neutral};
    @media(max-width: 40em) {
      display: none;
    }
  `,
  buttonAnchor: `
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
    background-color: ${colors.secondary};
  `,
  footerList: (styles) => `
    ${styles.list}

    justify-content: center;
    font-weight: ${fontWeights.h4};
  `
}
