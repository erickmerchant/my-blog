import {html} from '@erickmerchant/framework'

export const createIconsView =
  ({classes}) =>
  () =>
    html`
      <svg class=${classes.defs}>
        <symbol id="calendar" viewBox="0 0 100 100">
          <rect
            width="100"
            height="88"
            x="0"
            y="12"
            class=${classes.fill}
            stroke-width="0"
            rx="6"
          />
          <circle
            cx="27"
            cy="13"
            r="15"
            stroke-width="4"
            class=${classes.fill}
          />
          <circle
            cx="73"
            cy="13"
            r="15"
            stroke-width="4"
            class=${classes.fill}
          />
          <rect
            width="82"
            height="50"
            x="9"
            y="41"
            class=${classes.stroke}
            stroke-width="0"
          />
        </symbol>
        <symbol id="link" viewBox="0 0 100 100">
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
            width="60"
            transform="rotate(-45,50,50)"
            x="20"
            y="40"
            class=${classes.fill}
            stroke-width="3"
          />
        </symbol>
      </svg>
    `
