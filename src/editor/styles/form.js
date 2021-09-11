import {css} from '@erickmerchant/css'

import {borderRadius, buttonMixins, fontWeights} from './core.js'

export const formClasses = css`
  .form {
    display: grid;
    height: 100vh;
    grid-template-rows: repeat(3, min-content) 1fr min-content;
  }

  .field {
    padding: 1em;
    height: 100%;
    border: none;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }

  .label {
    font-weight: ${fontWeights.bold};
    display: block;
    display: flex;
    align-items: center;
    gap: 1em;
  }

  .input {
    color: var(--black);
    border-radius: ${borderRadius};
    width: 100%;
    padding: 0.5em;
    border: 1px solid var(--silver);
    background-color: var(--white);
  }

  .checkbox {
    color: var(--black);
  }

  .textareaWrap {
    border-radius: ${borderRadius};
    position: relative;
    width: 100%;
    margin-inline: auto;
    border: 1px solid var(--silver);
    margin-bottom: 1em;
    height: 100%;
  }

  .textareaHighlightsWrap {
    height: auto;
    min-height: 100%;
    padding: 0.5em;
  }

  .textareaHighlights {
    color: var(--black);
    height: auto;
    min-height: 100%;
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
    ${buttonMixins.textButton}
  }
`
