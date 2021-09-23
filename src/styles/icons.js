import {css} from '@erickmerchant/css';

export const iconsClasses = css`
  .defs {
    display: none;
  }

  .stroke {
    fill: hsl(var(--bg, 0 0% 100%));
    stroke: currentColor;
  }

  .fill {
    fill: currentColor;
    stroke: hsl(var(--bg, 0 0% 100%));
  }
`;
