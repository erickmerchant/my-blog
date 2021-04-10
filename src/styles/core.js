import {css} from '@erickmerchant/css'

export const fontWeights = {
  heading1: 900,
  heading2: 700,
  bold: 500,
  semibold: 300,
  normal: 100
}

export const _atrules = {
  colorSchemeDark: '@media (prefers-color-scheme: dark)',
  tabletUp: '@media (min-width: 768px)',
  desktopUp: '@media (min-width: 1024px)',
  tallUp: '@media (min-height: 420px)',
  veryMobile: '@media (max-width: 375px)'
}

export const mixins = css`
  .heading {
    line-height: 1.25;
    margin-bottom: 0.5em;
    margin-top: 1em;
  }

  .mainItem {
    max-width: 31rem;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    margin-right: auto;
    margin-left: auto;

    ${_atrules.tallUp} {
      ${_atrules.desktopUp} {
        margin-right: 2rem;
        margin-left: 2rem;
      }
    }
  }
`