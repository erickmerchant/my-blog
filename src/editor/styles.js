import {css} from '@erickmerchant/css'

const fontWeights = {
  heading: 700,
  bold: 500,
  normal: 300
}

const borderRadius = '3px'

export const _start = css`
  @font-face {
    font-display: fallback;
    font-family: 'Fira Code';
    font-style: normal;
    font-weight: 300 700;
    src: url('/fonts/fira-code/fira-code-subset.woff2') format('woff2');
  }

  * {
    box-sizing: border-box;
    max-width: 100%;
    margin: 0;
    padding: 0;
    font: inherit;
  }

  html {
    color-scheme: light dark;
    font-family: 'Fira Code', monospace;
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

const headerHeading = css`
   {
    font-weight: ${fontWeights.heading};
    font-size: 1.5em;
    padding-top: 0.5em;
    padding-bottom: 0.5em;
  }
`

const button = css`
   {
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
`

const textButton = css`
   {
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

const label = css`
   {
    font-weight: ${fontWeights.bold};
    display: block;
    margin-bottom: 0.5em;
  }
`

const input = css`
   {
    color: var(--black);
    border-radius: ${borderRadius};
    width: 100%;
    padding: 0.5em;
    border: 1px solid var(--silver);
    background-color: var(--white);
  }
`

export const layoutClasses = {
  app: css`
     {
      font-weight: ${fontWeights.normal};
      font-size: 16px;
      line-height: 1.5;
      color: var(--black);
      max-width: 100vw;
      overflow-x: scroll;
      height: 100%;
      background-color: var(--white);

      --z-index: 0;
    }
  `
}

export const listClasses = {
  headerHeading,
  createButton: button,
  textButton,
  tableContainer: css`
     {
      padding: 1em;
      height: 100%;
    }
  `,
  table: css`
     {
      width: 100%;
      border-collapse: collapse;
      border: 5px solid transparent;
    }
  `,
  th: css`
     {
      font-weight: ${fontWeights.bold};
      padding: 1em;
      text-align: left;
      border-bottom: 1px solid var(--silver);
    }
  `,
  td: css`
     {
      padding: 1em;
    }
  `,
  tableControls: css`
     {
      padding-top: 1em;
      padding-bottom: 1em;
      text-align: center;
    }
  `,
  editButton: textButton,
  viewButton: textButton,
  deleteButton: css`
     {
      ${textButton}

      color: var(--red);
    }
  `,
  tableButtons: css`
     {
      justify-content: flex-end;
      display: flex;
      gap: 1em;
      position: sticky;
      bottom: 0;
      padding: 1em;
      background: var(--white);
      border-top: 1px solid var(--silver);
    }
  `
}

export const formClasses = {
  form: css`
     {
      display: grid;
      grid-template-rows: 1fr max-content;
      height: 100%;
    }
  `,
  formFields: css`
     {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5em;
      padding: 1em;
      height: max-content;
    }
  `,
  formRow: css`
     {
      grid-column: span 2;
    }
  `,
  labelLarge: css`
     {
      ${label}

      font-size: 1.125em;
    }
  `,
  inputLarge: css`
     {
      ${input}

      font-weight: ${fontWeights.heading};
      font-size: 1.5em;
    }
  `,
  label,
  input,
  inputReadOnly: css`
     {
      ${input}

      background-color: var(--silver);
    }
  `,
  textareaWrap: css`
     {
      border-radius: ${borderRadius};
      position: relative;
      width: 100%;
      margin-right: auto;
      margin-left: auto;
      border: 1px solid var(--silver);
    }
  `,
  textareaHighlightsWrap: css`
     {
      min-height: 15em;
      padding: 0.5em;
    }
  `,
  textareaHighlights: css`
     {
      color: var(--black);
      min-height: 15em;
      overflow: auto;
      border-radius: 0;
      background-color: transparent;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `,
  textarea: css`
     {
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
      z-index: var(--z-index);
      caret-color: var(--black);
    }
  `,
  formButtons: css`
     {
      justify-content: flex-end;
      display: flex;
      gap: 1em;
      position: sticky;
      bottom: 0;
      padding: 1em;
      background: var(--white);
      border-top: 1px solid var(--silver);
    }
  `,
  cancelButton: textButton,
  saveButton: button
}

export const highlightClasses = {
  punctuation: css`
     {
      font-weight: ${fontWeights.normal};
      color: var(--gray);
    }
  `,
  bold: css`
     {
      font-weight: ${fontWeights.bold};
    }
  `,
  url: css`
     {
      color: var(--blue);
    }
  `,
  codeBlock: css`
     {
      font-weight: ${fontWeights.normal};
      color: var(--green);
      white-space: pre-wrap;
    }
  `,
  codeInline: css`
     {
      font-weight: ${fontWeights.normal};
      color: var(--green);
    }
  `,
  heading: css`
     {
      font-weight: ${fontWeights.heading};
      color: var(--black);
    }
  `,
  headingPunctuation: css`
     {
      font-weight: ${fontWeights.heading};
      color: var(--gray);
    }
  `
}

export const errorClasses = {
  errorContainer: css`
     {
      padding: 1em;
      height: 100%;
    }
  `,
  headerHeading,
  stackTrace: css`
     {
      color: var(--red);
      white-space: pre-wrap;
      word-break: break-word;
    }
  `
}
