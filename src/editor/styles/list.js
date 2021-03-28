import {css} from '@erickmerchant/css'

import {buttonMixins, fontWeights} from './core.js'

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
