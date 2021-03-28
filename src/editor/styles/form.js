import {css} from '@erickmerchant/css'

import {borderRadius, buttonMixins, fontWeights} from './core.js'

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

  .publishButton {
    ${buttonMixins.button}

    filter: hue-rotate(-15deg);
  }
`
