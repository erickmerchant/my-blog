import {css} from '@erickmerchant/css';

import {fontWeights, mixins, mq} from './core.js';

export const preferencesClasses = css`
  .footerAnchor {
    ${mixins.navAnchor}
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: hsl(0 0% 0% / 0.75);
    z-index: 1;
    display: grid;
    align-content: center;
    justify-content: center;

    @media ${mq.veryMobile} {
      justify-content: stretch;
    }
  }

  .modal {
    width: min(100vw, 31rem);
  }

  .form {
    border-radius: 0.25em;
    background: hsl(var(--bg2));
    padding: 2rem;
    margin: 1rem;
    display: flex;
    flex-direction: column;
    justify-items: start;
    align-content: center;
    gap: 1.5em;
  }

  .heading {
    ${mixins.heading}
    font-weight: ${fontWeights.heading1};
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 0;
  }

  .fieldset {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    white-space: nowrap;
  }

  .label {
    font-weight: ${fontWeights.normal};
  }

  .field {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .checkboxWrap {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .checkbox {
    appearance: none;
    -webkit-appearance: none;
    border: none;
    background: none;
    color: var(--c);

    --radio-c: transparent;

    &::before {
      content: '';
      background: radial-gradient(var(--radio-c) 40%, transparent 0%);
      border-radius: 100%;
      border: 2px solid currentColor;
      display: block;
      height: 0.875em;
      width: 0.875em;
    }

    &:checked {
      --radio-c: currentColor;
    }
  }

  .doneLinkAnchor {
    align-self: flex-end;
    color: hsl(var(--a-c));
    text-decoration: underline;
    text-decoration-thickness: 0.0625em;
    text-underline-offset: 0.125em;
    -webkit-tap-highlight-color: transparent;
    background: transparent;
    appearance: none;
    -webkit-appearance: none;
    border: none;
    cursor: pointer;
  }
`;
