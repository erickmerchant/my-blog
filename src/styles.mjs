const fontSizes = {
  h1: '1.5em',
  h2: '1.25em',
  h3: '1.125em',
  h5: '0.875em'
}

const colors = {
  primary: 'hsl(120, 50%, 50%)',
  secondary: 'hsl(120, 25%, 50%)',
  neutral: 'hsl(120, 12.25%, 50%)',
  bright: 'hsl(120, 75%, 75%)',
  dark: 'hsl(120, 50%, 12.25%)'
}

const borderRadius = '0.25em'

export const _start = `
  @font-face {
    font-display: swap;
    font-family: 'Public Sans';
    font-style: normal;
    font-weight: 1 999;
    src: url('/fonts/Public_Sans/PublicSans-VariableFont_wght-subset.woff2') format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Fira Code';
    font-style: normal;
    font-weight: 1 999;
    src: url('/fonts/Fira_Code/FiraCode-VariableFont_wght-subset.woff2') format('woff2');
  }

  * {
    box-sizing: border-box;
    font: inherit;
    line-height: 1.5;
    margin: 0;
    padding: 0;
    max-width: 100%;
  }

  html {
    height: 100%;
    font-family: "Public Sans", sans-serif;
    font-weight: 400;
  }

  h1,
  h2 {
    line-height: 1.25;
    font-weight: 800;
    margin-bottom: 0.5em;
    margin-top: 1em;
  }

  h1 {
    font-size: ${fontSizes.h1};
  }

  h2 {
    font-size: ${fontSizes.h2};
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

  a {
    box-shadow: 0 0.1em 0 0 currentcolor;
    color: var(--link-color, ${colors.primary});
  }

  a,
  a:hover {
    text-decoration: none;
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
    font-size: ${fontSizes.h3};
    background-color: ${colors.secondary};
  `,
  topNavList: (styles) => `
    ${styles.list}
    justify-content: center;
  `,
  date: `
    font-weight: 600;
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
  pre: `
    overflow: auto;
    padding: 1em;
    font-family: "Fira Code", monospace;
    font-weight: 400;
    white-space: pre-wrap;
    color: ${colors.bright};
    background-color: ${colors.dark};
    border-radius: ${borderRadius};
  `,
  list: `
    display: flex;
    color: white;
    flex-wrap: wrap;
    text-align: center;
    font-weight: 600;
    padding-top: 1em;
    padding-bottom: 1em;

    --link-color: currentColor;
  `,
  listItem: `
    margin: 1em;
  `,
  button: (styles) => `
    ${styles.listItem}
    flex: 1 1 calc(50% - 2em);
    padding: 1em 3em;
    font-size: ${fontSizes.h3};
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
  footer: `
    margin-top: 4em;
    background-color: ${colors.secondary};
  `,
  footerList: (styles) => `
    ${styles.list}
    justify-content: center;
    font-size: ${fontSizes.h5};
  `
}
