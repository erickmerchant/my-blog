import {html} from '@erickmerchant/framework'

export const createDateView =
  ({classes, dateUtils}) =>
  (d) => {
    const date = dateUtils.stringToDate(d)
    const year = date.getFullYear()
    const month = date.getMonth()
    const startDayOfMonth = new Date(year, month, 1).getDay()
    let daysInMonth =
      new Date(year, month + 1, 0).getDate() - (7 - startDayOfMonth)
    const weeks = [startDayOfMonth]

    while (daysInMonth > 0) {
      daysInMonth -= 7

      if (daysInMonth >= 0) {
        weeks.push(0)
      } else {
        weeks.push(daysInMonth)
      }
    }

    return html`
      <time class=${classes.time} :datetime=${d}>
        <svg viewBox="0 0 33 33" class=${classes.icon}>
          <use href="#calendar" />
          ${weeks.map(
            (week, i) => html`
              <use href="#week" :x=${week * 4} :y=${7 + i * 4} />
            `
          )}
        </svg>
        ${dateUtils.prettyDate(date)}
      </time>
    `
  }
