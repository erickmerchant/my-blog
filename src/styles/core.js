import {css} from '@erickmerchant/css'

export const fontWeights = {
  heading1: 900,
  heading2: 800,
  bold: 600,
  normal: 100
}

export const mq = {
  colorSchemeDark: '(prefers-color-scheme: dark)',
  colorSchemeLight: '(prefers-color-scheme: light)',
  tabletUp: '(min-width: 770px)',
  desktopUp: '(min-width: 1100px)',
  tallUp: '(min-height: 605px)',
  veryMobile: '(max-width: 440px)'
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

    @media ${mq.desktopUp} and ${mq.tallUp} {
      margin-right: 2rem;
      margin-left: 2rem;
    }
  }
`
