import {html} from '@erickmerchant/framework'

const yearsSince = (year, month) => {
  const thenAsFloat = year + month / 12

  const now = new Date()

  const nowAsFloat = now.getFullYear() + (now.getMonth() + 1) / 12

  return Math.floor(nowAsFloat - thenAsFloat)
}

export const createAboutView =
  ({classes}) =>
  () =>
    html`
      <article class=${classes.about}>
        <h3 class=${classes.heading}>About me</h3>
        <p class=${classes.paragraph}>
          I'm Erick Merchant. I've been employed as a web developer for
          ${yearsSince(2006, 6)} years. This is my web development blog. Check
          out my
          <a class=${classes.anchor} href="https://github.com/erickmerchant">
            ${'open-source projects'}
          </a>
          on Github.
        </p>
      </article>
    `
