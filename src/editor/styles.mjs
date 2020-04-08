import {colors, fontWeights, borderRadius, _start} from '../styles.mjs'

export {_start}

export const styles = {
  app: `
    height: 100%;
    color: ${colors.dark};
    font-size: 16px;
    padding: 1em;
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
  textButton: `
    appearance: none;
    border: none;
    padding: 0.5em;
    color: ${colors.primary};
    margin: 0 0.5em;
  `,
  table: `
    width: 100%;
    border-collapse: collapse;
  `,
  caption: `
    font-weight: ${fontWeights.h2};
    text-align: left;
    padding: 1em 1em 1em 0;
  `,
  th: (styles) => `
    ${styles.td}
    border-bottom: 1px solid ${colors.dark};
    font-weight: ${fontWeights.h3};
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
    background-color: hsla(0, 0%, 100%, 0.95);
    border: 1px solid transparent;
    border-radius: ${borderRadius};
    padding: 1em;
    display: flex;
    flex-direction: column;
  `,
  label: `
    margin: 1em 0 0.5em;
    font-weight: ${fontWeights.h3};
  `,
  input: `
    padding: 0.5em;
    width: 100%;
    border-radius: ${borderRadius};
    border: 1px solid ${colors.dark};
  `,
  textarea: `
    padding: 0.5em;
    width: 100%;
    border-radius: ${borderRadius};
    border: 1px solid ${colors.dark};
    flex: 1 1 auto;
  `,
  formButtons: `
    display: flex;
    justify-content: flex-end;
  `,
  cancelButton: (styles) => `
    ${styles.textButton}

    margin: 1em 0;
    padding: 1em 3em;
  `,
  saveButton: `
    float: right;
    appearance: none;
    color: white;
    margin: 1em 0 1em 1em;
    padding: 1em 3em;
    font-weight: ${fontWeights.h3};
    background-color: ${colors.primary};
    border-radius: ${borderRadius};
  `
}
