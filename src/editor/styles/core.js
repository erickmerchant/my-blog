import {css} from '@erickmerchant/css'

export const fontWeights = {
  heading: 700,
  bold: 500,
  normal: 300
}

export const borderRadius = '3px'

export const buttonMixins = css`
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
    border: none;
    background-color: var(--blue);

    :focus,
    :hover {
      opacity: 0.8;
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
