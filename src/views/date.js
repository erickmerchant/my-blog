import {html} from '@erickmerchant/framework'

export const createDateView =
  ({classes, dateUtils}) =>
  (d) => {
    const date = dateUtils.stringToDate(d)
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInTheMonth = new Date(year, month + 1, 0).getDate()
    const startDayOfMonth = new Date(year, month, 1).getDay()

    return html`
      <time class=${classes.time} :datetime=${d}>
        <svg viewBox="0 0 33 33" class=${classes.icon}>
          <rect
            width="33"
            height="33"
            x="0"
            y="0"
            class=${classes.foreground}
          />
          <rect
            width="29"
            height="26"
            x="2"
            y="5"
            class=${classes.background}
          />
          ${Array(daysInTheMonth)
            .fill('')
            .map((_, i) => {
              const weekOfMonth = Math.floor((i + startDayOfMonth) / 7)
              const dayOfWeek = (i + startDayOfMonth) % 7

              return html`
                <rect
                  width="3"
                  height="3"
                  class=${classes.foreground}
                  :x=${3 + dayOfWeek * 4}
                  :y=${7 + weekOfMonth * 4}
                />
              `
            })}
        </svg>
        <span>${dateUtils.prettyDate(date)}</span>
      </time>
    `
  }
