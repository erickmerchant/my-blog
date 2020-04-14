import {borderRadius, _start as _superStart} from '../styles.mjs'

export const fontWeights = {
  h1: 700,
  h2: 620,
  h3: 540,
  h4: 460,
  h5: 380,
  h6: 300
}

const colors = {
  black: '#000',
  white: '#FFF',
  green: '#0C0',
  blue: '#0CF',
  red: '#F30',
  gray1: '#333',
  gray2: '#666',
  gray3: '#CCC'
}

export const _start = `
  ${_superStart}

  @font-face {
    font-display: fallback;
    font-family: "Fira Code";
    font-style: normal;
    font-weight: 300 700;
    src: url("/fonts/Fira_Code/FiraCode-VariableFont_wght-subset.woff2") format("woff2");
  }

  pre {
    overflow: auto;
    padding: 0;
    white-space: pre-wrap;
    color: inherit;
    background-color: transparent;
    border-radius: 0;
  }
`

export const styles = {
  app: `
    font-family: "Fira Code";
    font-weight: ${fontWeights.h6};
    height: 100%;
    color: ${colors.black};
    font-size: 16px;
    padding: 1em;

    --z-index: 0;
  `,
  header: `
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  `,
  headerCell: `
    flex: 1 1 auto;
    margin: 0;
    padding: 0.5em 1em 0.5em 0;
  `,
  headerTextButtons: (styles) => `
    ${styles.headerCell}
    text-align: right;
  `,
  button: `
    appearance: none;
    color: ${colors.white};
    margin: 0 0.5em;
    padding: 0.5em 1.5em;
    font-weight: ${fontWeights.h3};
    background-color: ${colors.blue};
    border: none;
    border-radius: ${borderRadius};
    `,
  createButton: (styles) => `
    ${styles.button}
    `,
  textButton: `
    appearance: none;
    border: none;
    padding: 0.5em 1.5em;
    font-weight: ${fontWeights.h3};
    color: ${colors.blue};
    margin: 0 0.5em;
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
    border-bottom: 1px solid currentColor;
    font-weight: ${fontWeights.h2};
    text-align: left;
  `,
  td: `
    padding: 0.5em 1em 0.5em 0;
    white-space: nowrap;

    :last-child {
      text-align: right;
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
    border: 2px solid transparent;
    border-radius: ${borderRadius};
    padding: 1em;
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
    border: 2px solid currentColor;
    color: ${colors.gray1};
  `,
  inputLarge: (styles) => `
    ${styles.input}

    font-size: 1.25em;
  `,
  textareaWrap: `
    position: relative;
    width: 100%;
    height: max(15em, max-content);
    border: 2px solid currentColor;
    border-radius: ${borderRadius};
    margin: 0 auto;
    line-height: 1.5;
    `,
  textareaHighlightsWrap: `
    min-height: 15em;
    padding: 0.5em;
    background-color: ${colors.white};
    border-radius: ${borderRadius};
  `,
  textareaHighlights: `
    min-height: 15em;
    color: ${colors.gray1};
  `,
  highlightPunctuation: `
    color: ${colors.gray3};
    font-weight: ${fontWeights.h5};
    background-color: transparent;
  `,
  highlightCodeBlock: `
    color: ${colors.green};
    display: block;
    white-space: pre-wrap;
    background-color: transparent;
  `,
  highlightCodeInline: `
    color: ${colors.green};
    background-color: transparent;
  `,
  highlightUrl: `
    color: ${colors.blue};
    background-color: transparent;
  `,
  highlightHeading: `
    color: ${colors.black};
    font-weight: ${fontWeights.h3};
    background-color: transparent;
  `,
  highlightHeadingPunctuation: `
    color: ${colors.gray3};
    font-weight: ${fontWeights.h3};
    background-color: transparent;
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
    border-radius: ${borderRadius};
    margin: 0;
    caret-color: ${colors.gray1};
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

    margin: 1em 0;
    padding: 0.5em 1.5em;
  `,
  saveButton: (styles) => `
    ${styles.button}

    margin: 1em;
  `
}
