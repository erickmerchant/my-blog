const fontWeights = {
  heading: 700,
  bold: 500,
  normal: 300
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

    --black: hsl(100, 10%, 20%);
    --gray: hsl(100, 10%, 70%);
    --silver: hsl(100, 10%, 85%);
    --white: hsl(100, 10%, 100%);
    --green: hsl(100, 30%, 50%);
    --blue: hsl(200, 100%, 50%);
    --red: hsl(350, 80%, 55%);
  }

  @media (prefers-color-scheme: dark) {
    html {
      --black: hsl(100, 10%, 100%);
      --gray: hsl(100, 10%, 60%);
      --silver: hsl(100, 10%, 40%);
      --white: hsl(100, 10%, 20%);
      --green: hsl(100, 50%, 60%);
      --blue: hsl(200, 100%, 60%);
      --red: hsl(350, 80%, 65%);
    }
  }
`

const headerHeading = `
  font-weight: ${fontWeights.heading};
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  font-size: 1.5em;
`

const button = `
  border-radius: ${borderRadius};
  font-weight: ${fontWeights.bold};
  appearance: none;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  padding-right: 1.5em;
  padding-left: 1.5em;
  border: none;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid var(--blue);
  background-color: var(--blue);
  color: var(--white);

  :focus, :hover {
    filter: saturate(2);
    outline: 0;
  }
`

const textButton = `
  border-radius: ${borderRadius};
  font-weight: ${fontWeights.bold};
  appearance: none;
  padding-top: 0.5em;
  padding-bottom: 0.5em;
  padding-right: 1.5em;
  padding-left: 1.5em;
  background-color: transparent;
  box-shadow: none;
  text-decoration: none;
  cursor: pointer;
  text-align: center;
  display: inline-block;
  border: 1px solid var(--white);
  color: var(--blue);

  :hover {
    text-decoration: none;
  }

  :focus {
    outline: 0;
    border: 1px solid currentcolor;
    filter: saturate(2);
  }
`

const label = `
  font-weight: ${fontWeights.bold};
  display: block;
  margin-bottom: 0.5em;
`

const input = `
  border-radius: ${borderRadius};
  width: 100%;
  padding: 0.5em;
  border: 1px solid var(--silver);
  background-color: var(--white);
  color: var(--black);
`

export const layoutClasses = {
  app: `
    font-weight: ${fontWeights.normal};
    max-width: 100vw;
    line-height: 1.5;
    font-size: 16px;
    overflow-x: scroll;
    height: 100%;
    color: var(--black);
    background-color: var(--white);

    --z-index: 0;
  `
}

export const listClasses = {
  headerHeading,
  createButton: button,
  textButton,
  tableContainer: `
    padding: 1em;
    height: 100%;
  `,
  table: `
    width: 100%;
    border-collapse: collapse;
    border: 5px solid transparent;
  `,
  th: `
    font-weight: ${fontWeights.bold};
    padding: 1em;
    text-align: left;
    border-bottom: 1px solid var(--silver);
  `,
  td: `
    padding: 1em;
  `,
  tableControls: `
    padding-top: 1em;
    padding-bottom: 1em;
    text-align: center;
  `,
  editButton: textButton,
  viewButton: textButton,
  deleteButton: `
    ${textButton}

    color: var(--red);
  `,
  tableButtons: `
    justify-content: flex-end;
    display: flex;
    gap: 1em;
    position: sticky;
    bottom: 0;
    padding: 1em;
    background: var(--white);
    border-top: 1px solid var(--silver);
  `
}

export const formClasses = {
  form: `
    display: grid;
    grid-template-rows: 1fr max-content;
    height: 100%;
  `,
  formFields: `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5em;
    padding: 1em;
    height: max-content;
  `,
  formRow: `
    grid-column: span 2;
  `,
  labelLarge: `
    ${label}

    font-size: 1.125em;
  `,
  inputLarge: `
    ${input}

    font-weight: ${fontWeights.heading};
    font-size: 1.5em;
  `,
  label,
  input,
  inputReadOnly: `
    ${input}

    background-color: var(--silver);
  `,
  textareaWrap: `
    border-radius: ${borderRadius};
    position: relative;
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    border: 1px solid var(--silver);
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
    color: var(--black);
  `,
  textarea: `
    border-radius: ${borderRadius};
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0.5em;
    overflow: hidden;
    border: none;
    background-color: transparent;
    color: transparent;
    word-break: break-word;
    resize: none;
    z-index: var(--z-index);
    caret-color: var(--black);
  `,
  formButtons: `
    justify-content: flex-end;
    display: flex;
    gap: 1em;
    position: sticky;
    bottom: 0;
    padding: 1em;
    background: var(--white);
    border-top: 1px solid var(--silver);
  `,
  cancelButton: textButton,
  saveButton: button
}

export const highlightClasses = {
  punctuation: `
    font-weight: ${fontWeights.normal};
    color: var(--gray);
  `,
  bold: `
    font-weight: ${fontWeights.bold};
  `,
  url: `
    color: var(--blue);
  `,
  codeBlock: `
    font-weight: ${fontWeights.normal};
    white-space: pre-wrap;
    color: var(--green);
  `,
  codeInline: `
    font-weight: ${fontWeights.normal};
    color: var(--green);
  `,
  heading: `
    font-weight: ${fontWeights.heading};
    color: var(--black);
  `,
  headingPunctuation: `
    font-weight: ${fontWeights.heading};
    color: var(--gray);
  `
}

export const errorClasses = {
  errorContainer: `
    padding: 1em;
    height: 100%;
  `,
  headerHeading,
  stackTrace: `
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--red);
  `
}
