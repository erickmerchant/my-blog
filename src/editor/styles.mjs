import {_start as _superStart} from '../styles.mjs'

export const fontWeights = {
  h1: 700,
  h2: 620,
  h3: 540,
  h4: 460,
  h5: 380,
  h6: 300
}

const colors = {
  black: 'hsl(120, 10%, 20%)',
  gray: 'hsl(120, 10%, 75%)',
  white: 'hsl(120, 10%, 100%)',
  green: 'hsl(120, 60%, 50%)',
  blue: 'hsl(200, 100%, 50%)',
  red: 'hsl(350, 90%, 50%)'
}

const borderRadius = '3px'

export const _start = `
  ${_superStart}

  @font-face {
    font-display: fallback;
    font-family: "Fira Code";
    font-style: normal;
    font-weight: 300 700;
    src: url("/fonts/Fira_Code/FiraCode-VariableFont_wght-subset.woff2") format("woff2");
  }
`

export const styles = {
  app: `
    font-family: "Fira Code";
    font-weight: ${fontWeights.h6};
    height: 100%;
    color: ${colors.black};
    font-size: 16px;
    padding: 2em;

    --z-index: 0;
    --link-color: ${colors.blue};
  `,
  header: `
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  `,
  headerCell: `
    flex: 1 1 auto;
    margin: 0;
    padding: 0.5em 0;
  `,
  headerTextButtons: (styles) => `
    ${styles.headerCell}
    text-align: right;
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
  `,
  deleteButton: (styles) => `
    ${styles.textButton}

    color: ${colors.red};
  `,
  table: `
    width: 100%;
    border-collapse: collapse;
  `,
  caption: `
    font-weight: ${fontWeights.h1};
    text-align: left;
    padding: 1em 1em 1em 0;
  `,
  th: (styles) => `
    ${styles.td}
    border-bottom: 1px solid ${colors.black};
    font-weight: ${fontWeights.h2};
    text-align: left;
  `,
  td: `
    padding: 1em 1em 1em 0;
    white-space: nowrap;

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
    border: 1px solid ${colors.black};
    color: ${colors.black};
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
    border: 1px solid ${colors.black};
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
  `,
  highlightPunctuation: `
    color: ${colors.gray};
    font-weight: ${fontWeights.h5};
  `,
  highlightCodeBlock: `
    color: ${colors.green};
    display: block;
    white-space: pre-wrap;
  `,
  highlightCodeInline: `
    color: ${colors.green};
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
  `
}
