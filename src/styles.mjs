const fontSizes = {
  h1: '1.5em',
  h2: '1.25em',
  h3: '1.125em',
  h5: '0.875em'
}
const borderRadius = '0.25em'

const list = `
  display: flex;
  color: white;
  flex-wrap: wrap;
  text-align: center;
  font-weight: 700;
  padding-top: 1em;
  padding-bottom: 1em;

  --link-color: currentColor;
`

const listItem = `
  margin-top: 1em;
  margin-bottom: 1em;
  margin-right: 1em;
  margin-left: 1em;
`

const button = `
  ${listItem}
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: calc(50% - 2em);
  padding-top: 1em;
  padding-bottom: 1em;
  padding-right: 3em;
  padding-left: 3em;
  font-size: ${fontSizes.h3};
  background-color: var(--primary-color);

  --border-radius: ${borderRadius};
`

export const _start = `
  @font-face {
    font-display: swap;
    font-family: 'PT Sans';
    font-style: normal;
    font-weight: 400;
    src:
      local('PT Sans'),
      local('PTSans-Regular'),
      url('/fonts/pt-sans-v11-latin-regular.woff2') format('woff2'),
      url('/fonts/pt-sans-v11-latin-regular.woff') format('woff');
  }

  @font-face {
    font-display: swap;
    font-family: 'PT Sans';
    font-style: normal;
    font-weight: 700;
    src:
      local('PT Sans Bold'),
      local('PTSans-Bold'),
      url('/fonts/pt-sans-v11-latin-700.woff2') format('woff2'),
      url('/fonts/pt-sans-v11-latin-700.woff') format('woff');
  }

  @font-face {
    font-display: swap;
    font-family: 'PT Mono';
    font-style: normal;
    font-weight: 400;
    src:
      local('PT Mono'),
      local('PTMono-Regular'),
      url('/fonts/pt-mono-v7-latin-regular.woff2') format('woff2'),
      url('/fonts/pt-mono-v7-latin-regular.woff') format('woff');
  }

  * {
    box-sizing: border-box;
    font: inherit;
    line-height: 1.5;
    margin: 0;
    padding: 0;
    max-width: 100%;
    border-radius: var(--border-radius);

    --border-radius: 0;
  }

  html {
    height: 100%;
  }

  h1,
  h2 {
    line-height: 1.25;
    font-weight: 700;
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
    color: var(--link-color, var(--primary-color));
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
    color: var(--dark-color);
    font-family: "PT Sans", sans-serif;
    flex-direction: column;
    --primary-color: hsl(120, 50%, 50%);
    --secondary-color: hsl(120, 25%, 50%);
    --neutral-color: hsl(120, 12.25%, 50%);
    --bright-color: hsl(120, 75%, 75%);
    --dark-color: hsl(120, 50%, 12.25%);
  `,
  topNav: `
    font-size: ${fontSizes.h3};
    background-color: var(--secondary-color);
  `,
  topNavList: `
    ${list}
    justify-content: center;
  `,
  date: `
    font-weight: 700
  `,
  main: `
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
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
    overflow-y: auto;
    overflow-x: auto;
    color: var(--bright-color);
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 1em;
    padding-left: 1em;
    font-family: "PT Mono", monospace;
    white-space: pre-wrap;
    background-color: var(--dark-color);

    --border-radius: ${borderRadius};
  `,
  list,
  listItem,
  button,
  buttonDisabled: `
    ${button}
    background-color: var(--neutral-color);
    @media (max-width: 40em) {
      display: none;
    }
  `,
  footer: `
    margin-top: 4em;
    background-color: var(--secondary-color);
  `,
  footerList: `
    ${list}
    justify-content: center;
    font-size: ${fontSizes.h5};
  `
}
