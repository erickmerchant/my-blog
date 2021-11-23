import {html} from '@hyper-views/framework';

export const createIconsView =
  ({classes}) =>
  (type, className) => {
    if (type === 'calendar') {
      return html`
        <svg viewBox="0 0 100 100" :class=${className}>
          <rect
            width="100"
            height="100"
            x="0"
            y="0"
            rx="6"
            stroke-width="0"
            class=${classes.fill}
          />
          <rect
            width="82"
            height="61"
            x="9"
            y="30"
            stroke-width="0"
            class=${classes.stroke}
          />
          <rect
            width="28"
            height="28"
            x="18"
            y="39"
            stroke-width="0"
            class=${classes.fill}
          />
        </svg>
      `;
    }

    if (type === 'link') {
      return html`
        <svg viewBox="0 0 100 100" :class=${className}>
          <circle
            cx="30"
            cy="70"
            r="21"
            stroke-width="15"
            class=${classes.stroke}
          />
          <circle
            cx="70"
            cy="30"
            r="21"
            stroke-width="15"
            class=${classes.stroke}
          />
          <rect
            height="20"
            width="50"
            transform="rotate(-45,50,50)"
            x="25"
            y="40"
            stroke-width="3"
            class=${classes.fill}
          />
        </svg>
      `;
    }
  };
