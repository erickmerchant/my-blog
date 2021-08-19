import {css} from '@erickmerchant/css'

export const fontWeights = {
  heading: 900,
  bold: 700,
  normal: 300
}

export const borderRadius = '3px'

export const buttonMixins = {
  button: css`
    & {
      font-weight: ${fontWeights.bold};
      color: var(--white);
      border-radius: ${borderRadius};
      appearance: none;
      -webkit-appearance: none;
      padding: 0.5em 1.5em;
      border: none;
      text-decoration: none;
      cursor: pointer;
      border: none;
      background-color: var(--blue);

      &:focus,
      &:hover {
        opacity: 0.8;
        outline: 0;
      }
    }
  `,
  textButton: css`
    & {
      display: inline-flex;
      font-weight: ${fontWeights.bold};
      color: var(--blue);
      border-radius: ${borderRadius};
      appearance: none;
      -webkit-appearance: none;
      padding: 0.5em 1.5em;
      background-color: transparent;
      box-shadow: none;
      text-decoration: none;
      cursor: pointer;
      text-align: center;
      border: 1px solid var(--white);

      &:hover {
        text-decoration: none;
      }

      &:focus {
        outline: 0;
        border: 1px solid currentcolor;
        filter: saturate(2);
      }
    }
  `
}
