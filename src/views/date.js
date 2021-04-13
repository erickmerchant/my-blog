import {html} from '@erickmerchant/framework'

export const createDateView = ({classes, dateUtils}) => (d) => {
  const date = dateUtils.stringToDate(d)
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInTheMonth = new Date(year, month + 1, 0).getDate()

  return html`
    <time class=${classes.time} datetime=${d}>
      <svg viewBox="0 0 33 33" class=${classes.icon}>
        <rect width="33" height="33" x="0" y="0" class=${classes.foreground} />
        <rect width="29" height="26" x="2" y="5" class=${classes.background} />
        ${{
          *[Symbol.iterator]() {
            let dayOfWeek = new Date(year, month, 1).getDay()
            let weekOfMonth = 0
            let i = 1

            do {
              yield html`
                <rect
                  width="3"
                  height="3"
                  x=${3 + dayOfWeek * 4}
                  y=${7 + weekOfMonth * 4}
                  class=${classes.foreground}
                />
              `

              i++

              dayOfWeek++

              if (dayOfWeek > 6) {
                weekOfMonth++

                dayOfWeek = 0
              }
            } while (i <= daysInTheMonth)
          }
        }}
      </svg>
      <span>${dateUtils.prettyDate(date)}</span>
    </time>
  `
}
