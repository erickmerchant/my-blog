export const fontWeights = {
  h1: 700,
  h2: 620,
  h3: 540,
  h4: 460,
  h5: 380,
  h6: 300
}

const colors = {
  black: 'hsl(100, 10%, 20%)',
  gray: 'hsl(100, 10%, 75%)',
  silver: 'hsl(100, 10%, 85%)',
  white: 'hsl(100, 10%, 100%)',
  green: 'hsl(100, 30%, 50%)',
  blue: 'hsl(200, 100%, 50%)',
  red: 'hsl(350, 80%, 55%)'
}

const borderRadius = '3px'

export const _start = `
  @font-face {
    font-display: fallback;
    font-family: "Fira Code";
    font-style: normal;
    font-weight: 300 700;
    src: url("/fonts/Fira_Code/FiraCode-VariableFont_wght-subset.woff2") format("woff2");
  }

  * {
    box-sizing: border-box;
    font: inherit;
    margin: 0;
    padding: 0;
    max-width: 100%;
  }

  html {
    font-family: "Fira Code", monospace;
    height: 100%;
  }
`

export const styles = {
  app: `
    font-weight: ${fontWeights.h6};
    line-height: 1.5;
    font-size: 16px;
    color: ${colors.black};
    padding: 2em;
    max-width: 100vw;

    --z-index: 0;
  `,
  header: `
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    border: 5px solid transparent;
  `,
  headerHeading: `
    flex: 1 1 auto;
    margin: 0;
    padding: 0.5em 0;
    font-size: 1.5em;
    font-weight: ${fontWeights.h1};
  `,
  headerTextButtons: (styles) => `
    ${styles.headerHeading}
    text-align: right;
    font-size: 1.125em;
  `,
  button: `
    appearance: none;
    margin-left: 1.5em;
    padding: 0.5em 1.5em;
    font-weight: ${fontWeights.h3};
    background-color: ${colors.blue};
    color: ${colors.white};
    border: none;
    border-radius: ${borderRadius};
    cursor: pointer;
    text-decoration: none;

    :hover {
      text-decoration: none;
    }
  `,
  createButton: (styles) => `
    ${styles.button}
  `,
  textButton: `
    appearance: none;
    margin-left: 0.25em;
    padding: 0.5em 1.5em;
    font-weight: ${fontWeights.h3};
    color: ${colors.blue};
    border: none;
    border-radius: ${borderRadius};
    box-shadow: none;
    cursor: pointer;
    text-decoration: none;

    :hover {
      text-decoration: none;
    }
  `,
  deleteButton: (styles) => `
    ${styles.textButton}

    color: ${colors.red};
  `,
  tableWrap: `
    max-width: 100%;
    overflow-x: scroll;
  `,
  table: `
    width: 100%;
    border-collapse: collapse;
    border: 5px solid transparent;
  `,
  caption: `
    font-weight: ${fontWeights.h1};
    text-align: left;
    padding: 1em 1em 1em 0;
  `,
  th: (styles) => `
    ${styles.td}
    border-bottom: 1px solid ${colors.silver};
    font-weight: ${fontWeights.h2};
    text-align: left;
  `,
  td: `
    padding: 1em 1em 1em 0;

    :last-child {
      text-align: right;
      padding-right: 0;
    }
  `,
  form: `
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    overflow-y: scroll;
    background-color: ${colors.white};
    padding: 2em;
    display: flex;
    flex-direction: column;
  `,
  formRow: `
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  `,
  formColumn: `
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    margin-right: 1em;

    :last-child {
      margin-right: 0;
    }
  `,
  label: `
    margin: 1em 0 0.5em;
    font-weight: ${fontWeights.h4};
  `,
  labelLarge: (styles) => `
    ${styles.label}

    font-size: 1.125em;
  `,
  input: `
    padding: 0.5em;
    width: 100%;
    border-radius: ${borderRadius};
    border: 1px solid ${colors.silver};
    color: ${colors.black};

    :read-only {
      background: ${colors.silver};
    }
  `,
  inputLarge: (styles) => `
    ${styles.input}

    font-size: 1.25em;
  `,
  textareaWrap: `
    position: relative;
    width: 100%;
    margin: 0 auto;
    line-height: 1.5;
    border-radius: ${borderRadius};
    border: 1px solid ${colors.silver};
  `,
  textareaHighlightsWrap: `
    min-height: 15em;
    padding: 0.5em;
  `,
  textareaHighlights: `
    min-height: 15em;
    color: ${colors.black};
    overflow: auto;
    padding: 0;
    white-space: pre-wrap;
    color: inherit;
    border-radius: 0;
    background-color: transparent;
    white-space: pre-wrap;
    word-break: break-word;
  `,
  highlightPunctuation: `
    color: ${colors.gray};
    font-weight: ${fontWeights.h5};
  `,
  highlightBold: `
    font-weight: ${fontWeights.h4};
  `,
  highlightUrl: `
    box-shadow: 0 0.1em 0 0 currentColor;
    color: ${colors.blue};
    text-decoration: none;

    :hover {
      text-decoration: none;
    }
  `,
  highlightCodeBlock: `
    color: ${colors.green};
    white-space: pre-wrap;
    font-weight: ${fontWeights.h5};
  `,
  highlightCodeInline: `
    color: ${colors.green};
    font-weight: ${fontWeights.h5};
  `,
  highlightHeading: `
    color: ${colors.black};
    font-weight: ${fontWeights.h2};
  `,
  highlightHeadingPunctuation: `
    color: ${colors.gray};
    font-weight: ${fontWeights.h2};
  `,
  textarea: `
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: var(--z-index);
    width: 100%;
    padding: 0.5em;
    margin: 0;
    border: none;
    border-radius: ${borderRadius};
    caret-color: ${colors.black};
    color: transparent;
    background-color: transparent;
    overflow: hidden;
    word-break: break-word;
    resize: none;
  `,
  formButtons: `
    display: flex;
    justify-content: flex-end;
  `,
  cancelButton: (styles) => `
    ${styles.textButton}

    margin-top: 1em;
  `,
  saveButton: (styles) => `
    ${styles.button}

    margin-top: 1em;
  `,
  stackTrace: `
    color: ${colors.red};
    white-space: pre-wrap;
    word-break: break-word;
  `
}
