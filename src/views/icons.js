import {html} from '@erickmerchant/framework'

export const createIconsView =
  ({classes}) =>
  () =>
    html`
      <svg class=${classes.defs}>
        <symbol id="link" viewBox="0 0 100 100">
          <circle
            cx="30"
            cy="70"
            r="22.5"
            stroke-width="15"
            class=${classes.stroke}
          />
          <circle
            cx="70"
            cy="30"
            r="22.5"
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
        <symbol id="calendar" viewBox="0 0 33 33">
          <rect
            width="33"
            height="33"
            x="0"
            y="0"
            class=${classes.fill}
            stroke-width="0"
          />
          <rect
            width="29"
            height="26"
            x="2"
            y="5"
            class=${classes.stroke}
            stroke-width="0"
          />
        </symbol>
        <symbol id="day" viewBox="0 0 33 33">
          <rect
            width="3"
            height="3"
            class=${classes.fill}
            stroke-width="0"
            x="0"
            y="0"
          />
        </symbol>
        <symbol id="week" viewBox="0 0 33 33">
          <use href="#day" x="3" />
          <use href="#day" x="7" />
          <use href="#day" x="11" />
          <use href="#day" x="15" />
          <use href="#day" x="19" />
          <use href="#day" x="23" />
          <use href="#day" x="27" />
        </symbol>
      </svg>
    `
