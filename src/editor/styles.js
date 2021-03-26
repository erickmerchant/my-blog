import {css} from '@erickmerchant/css'

const fontWeights = {
  heading: 700,
  bold: 500,
  normal: 300
}

const borderRadius = '3px'

export const _start = css`
  * {
    box-sizing: border-box;
    max-width: 100%;
    margin: 0;
    padding: 0;
    font: inherit;
  }

  html {
    color-scheme: light dark;
    font-family: 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace;
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
      --silver: hsl(100, 10%, 55%);
      --white: hsl(100, 10%, 20%);
      --green: hsl(100, 50%, 60%);
      --blue: hsl(200, 100%, 60%);
      --red: hsl(350, 80%, 65%);
    }
  }
`

const buttonMixins = css`
  .button {
    font-weight: ${fontWeights.bold};
    color: var(--white);
    border-radius: ${borderRadius};
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

    :focus,
    :hover {
      filter: saturate(2);
      outline: 0;
    }
  }

  .textButton {
    font-weight: ${fontWeights.bold};
    color: var(--blue);
    border-radius: ${borderRadius};
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

    :hover {
      text-decoration: none;
    }

    :focus {
      outline: 0;
      border: 1px solid currentcolor;
      filter: saturate(2);
    }
  }
`

export const layoutClasses = css`
  .app {
    font-weight: ${fontWeights.normal};
    font-size: 16px;
    line-height: 1.5;
    color: var(--black);
    max-width: 100vw;
    overflow-x: scroll;
    height: 100%;
    background-color: var(--white);
  }
`

export const listClasses = css`
  .nav {
    list-style: none;
    padding: 1em;
  }

  .navItem {
    display: inline-block;
    margin-right: 1em;
  }

  .navAnchor {
    ${buttonMixins.textButton}
  }

  .navAnchorCurrent {
    ${buttonMixins.textButton}

    outline: 0;
    border: 1px solid currentcolor;
    filter: saturate(2);
  }

  .createButton {
    ${buttonMixins.button}
  }

  .textButton {
    ${buttonMixins.textButton}
  }

  .container {
    display: grid;
    height: 100vh;
    grid-template-rows: min-content auto min-content;
  }

  .tableWrapper {
    max-width: 100%;
    overflow-y: scroll;
    height: auto;
    padding-right: 1em;
    padding-left: 1em;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    border: 5px solid transparent;
  }

  .th {
    font-weight: ${fontWeights.bold};
    padding: 1em;
    text-align: left;
    border-bottom: 1px solid var(--silver);
  }

  .td {
    padding: 1em;
  }

  .controls {
    padding-top: 0.5em;
    padding-bottom: 0.5em;
    text-align: center;
  }

  .editButton {
    ${buttonMixins.textButton}
  }

  .deleteButton {
    ${buttonMixins.textButton}

    color: var(--red);
  }

  .buttons {
    justify-content: flex-end;
    display: flex;
    gap: 1em;
    padding: 1em;
    background: var(--white);
    border-top: 1px solid var(--silver);
  }
`

export const formClasses = css`
  .form {
    display: grid;
    height: 100vh;
    grid-template-rows: auto max-content;
  }

  .fields {
    overflow-y: scroll;
    padding: 1em;
    height: 100%;
    border: none;
    display: grid;
    gap: 1em;
    grid-auto-rows: min-content;
  }

  .label {
    font-weight: ${fontWeights.bold};
    display: block;
    margin-bottom: 0.5em;
  }

  .input {
    color: var(--black);
    border-radius: ${borderRadius};
    width: 100%;
    padding: 0.5em;
    border: 1px solid var(--silver);
    background-color: var(--white);
  }

  .textareaWrap {
    border-radius: ${borderRadius};
    position: relative;
    width: 100%;
    margin-right: auto;
    margin-left: auto;
    border: 1px solid var(--silver);
    margin-bottom: 1em;
  }

  .textareaHighlightsWrap {
    min-height: 15em;
    padding: 0.5em;
  }

  .textareaHighlights {
    color: var(--black);
    min-height: 15em;
    overflow: auto;
    border-radius: 0;
    background-color: transparent;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .textarea {
    color: transparent;
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
    word-break: break-word;
    resize: none;
    caret-color: var(--black);
  }

  .errorMessage {
    justify-self: flex-start;
    align-self: center;
    text-align: center;
    flex: 1 1 auto;
    color: var(--red);
  }

  .buttons {
    justify-content: flex-end;
    display: flex;
    gap: 1em;
    padding: 1em;
    background: var(--white);
    border-top: 1px solid var(--silver);
  }

  .cancelButton {
    ${buttonMixins.textButton}
  }

  .saveButton {
    ${buttonMixins.button}
  }
`

export const highlightClasses = css`
  .punctuation {
    font-weight: ${fontWeights.normal};
    color: var(--gray);
  }

  .bold {
    font-weight: ${fontWeights.bold};
  }

  .url {
    color: var(--blue);
  }

  .codeBlock {
    font-weight: ${fontWeights.normal};
    color: var(--green);
    white-space: pre-wrap;
  }

  .codeInline {
    font-weight: ${fontWeights.normal};
    color: var(--green);
  }

  .heading {
    font-weight: ${fontWeights.heading};
    color: var(--black);
  }

  .headingPunctuation {
    font-weight: ${fontWeights.heading};
    color: var(--gray);
  }
`

export const errorClasses = css`
  .container {
    padding: 1em;
    height: 100%;
  }

  .heading {
    font-weight: ${fontWeights.heading};
    font-size: 1.5em;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }

  .stack {
    color: var(--red);
    white-space: pre-wrap;
    word-break: break-word;
  }
`
