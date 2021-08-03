import {css} from '@erickmerchant/css'

import {buttonMixins, fontWeights} from './core.js'

export const listClasses = css`
  .createButton {
    ${buttonMixins.button}
  }

  .textButton {
    ${buttonMixins.textButton}
  }

  .container {
    display: grid;
    height: 100vh;
    grid-template-rows: auto min-content;
  }

  .tableWrapper,
  .tableWrapperEmpty {
    display: grid;
    max-width: 100%;
    overflow-y: scroll;
    height: auto;
    padding-inline: 1em;
    align-items: center;
  }

  .tableWrapper {
    align-items: start;
  }

  .noTable {
    text-align: center;
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
    padding-block: 0.5em;
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
