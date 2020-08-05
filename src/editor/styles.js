const fontWeights = {
  heading: 700,
  bold: 500,
  normal: 300
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
    max-width: 100%;
    margin: 0;
    padding: 0;
    font: inherit;
  }

  html {
    font-family: "Fira Code", monospace;
    height: 100%;
  }
`

const button = `
  appearance: none;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  padding-right: 1.5em;
  padding-left: 1.5em;
  border: none;
  border-radius: ${borderRadius};
  border: 1px solid ${colors.blue};
  background-color: ${colors.blue};
  color: ${colors.white};
  font-weight: ${fontWeights.bold};
  text-decoration: none;
  cursor: pointer;

  :focus, :hover {
    filter: saturate(2);
    outline: 0;
  }
`

export const styles = {
  app: `
    max-width: 100vw;
    padding: 2em;
    line-height: 1.5;
    font-size: 16px;
    font-weight: ${fontWeights.normal};
    color: ${colors.black};
    overflow-x: scroll;

    --z-index: 0;
  `,
  header: `
    display: grid;
    grid-template-columns: max-content 1fr max-content;
    align-items: center;
    border: 5px solid transparent;
  `,
  headerHeading: `
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    font-size: 1.5em;
    font-weight: ${fontWeights.heading};
  `,
  createButton: button,
  textButton: `
    appearance: none;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    padding-right: 1.5em;
    padding-left: 1.5em;
    background: transparent;
    border: 1px solid white;
    border-radius: ${borderRadius};
    box-shadow: none;
    color: ${colors.blue};
    font-weight: ${fontWeights.bold};
    text-decoration: none;
    cursor: pointer;

    :hover {
      text-decoration: none;
    }

    :focus {
      outline: 0;
      border: 1px solid currentcolor;
      filter: saturate(2);
    }
  `,
  deleteButton: (styles) => `
    ${styles.textButton}

    color: ${colors.red};
  `,
  table: `
    width: 100%;
    border-collapse: collapse;
    border: 5px solid transparent;
  `,
  th: (styles) => `
    ${styles.td}

    border-bottom: 1px solid ${colors.silver};
    text-align: left;
    font-weight: ${fontWeights.bold};
  `,
  td: `
    padding-top: 1em;
    padding-bottom: 1em;
    padding-right: 1em;

    :last-child {
      padding-right: 0;
      text-align: right;
    }
  `,
  tableControls: `
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  `,
  form: `
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1.5em;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    padding: 2em;
    background-color: ${colors.white};
  `,
  formRow: `
    grid-column: 1 / span 2;
  `,
  label: `
    display: block;
    margin-bottom: 0.5em;
    font-weight: ${fontWeights.bold};
  `,
  labelLarge: (styles) => `
    ${styles.label}

    font-size: 1.125em;
  `,
  input: `
    width: 100%;
    padding: 0.5em;
    border-radius: ${borderRadius};
    border: 1px solid ${colors.silver};
    color: ${colors.black};
  `,
  inputReadOnly: (styles) => `
    ${styles.input}

    background: ${colors.silver};
  `,
  inputLarge: (styles) => `
    ${styles.input}

    font-size: 1.25em;
  `,
  textareaWrap: `
    position: relative;
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    border-radius: ${borderRadius};
    border: 1px solid ${colors.silver};
  `,
  textareaHighlightsWrap: `
    min-height: 15em;
    padding: 0.5em;
  `,
  textareaHighlights: `
    min-height: 15em;
    overflow: auto;
    border-radius: 0;
    background-color: transparent;
    white-space: pre-wrap;
    word-break: break-word;
    color: ${colors.black};
  `,
  highlightPunctuation: `
    color: ${colors.gray};
    font-weight: ${fontWeights.normal};
  `,
  highlightBold: `
    font-weight: ${fontWeights.bold};
  `,
  highlightUrl: `
    box-shadow: 0 0.1em 0 0 currentcolor;
    color: ${colors.blue};
    text-decoration: none;

    :hover {
      text-decoration: none;
    }
  `,
  highlightCodeBlock: `
    white-space: pre-wrap;
    color: ${colors.green};
    font-weight: ${fontWeights.normal};
  `,
  highlightCodeInline: `
    color: ${colors.green};
    font-weight: ${fontWeights.normal};
  `,
  highlightHeading: `
    color: ${colors.black};
    font-weight: ${fontWeights.heading};
  `,
  highlightHeadingPunctuation: `
    color: ${colors.gray};
    font-weight: ${fontWeights.heading};
  `,
  textarea: `
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: var(--z-index);
    width: 100%;
    height: 100%;
    padding: 0.5em;
    overflow: hidden;
    border: none;
    border-radius: ${borderRadius};
    background-color: transparent;
    color: transparent;
    caret-color: ${colors.black};
    word-break: break-word;
    resize: none;
  `,
  formButtons: `
    grid-column: 1 / span 2;
    justify-self: end;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1em;
  `,
  cancelButton: (styles) => `
    ${styles.textButton}

    margin-top: 1em;
  `,
  saveButton: `
    ${button}

    margin-top: 1em;
  `,
  stackTrace: `
    color: ${colors.red};
    white-space: pre-wrap;
    word-break: break-word;
  `
}
