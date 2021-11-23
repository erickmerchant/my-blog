import {css} from 'dedupe.css';

export const iconsClasses = css`
  .stroke {
    fill: hsl(var(--bg, 0 0% 100%));
    stroke: currentColor;
  }

  .fill {
    fill: currentColor;
    stroke: hsl(var(--bg, 0 0% 100%));
  }
`;
