import * as parent from '../styles.mjs'

const {colors, fontWeights} = parent

export const _start = `
  ${parent._start}
`

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
  headerControls: (styles) => `
    ${styles.headerCell}
    text-align: right;
  `,
  control: `
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
  `
}
