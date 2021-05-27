import {html} from '@erickmerchant/framework'

const yearsSince = (year, month) => {
  const thenAsFloat = year + (month + 1) / 12

  const now = new Date()

  const nowAsFloat = now.getFullYear() + (now.getMonth() + 1) / 12

  return Math.floor(nowAsFloat - thenAsFloat)
}

const aboutContent = `
# About me

I'm Erick Merchant. I've been employed as a web developer for ${yearsSince(
  2006,
  6
)} years. This is my web development blog. Check out my [open-source projects](https://github.com/erickmerchant) on Github.
`

export const getAboutContentTemplates = ({classes}) => {
  return {
    anchor: (text, href) =>
      html`
        <a class=${classes.anchor} :href=${href}>${text}</a>
      `,
    paragraph: (items) =>
      items.length
        ? html`
            <p class=${classes.paragraph}>${items}</p>
          `
        : null,
    heading: (text) =>
      html`
        <h3 class=${classes.heading}>${text}</h3>
      `
  }
}

export const createAboutView =
  ({classes, contentView}) =>
  () =>
    html`
      <article class=${classes.about}>${contentView(aboutContent)}</article>
    `
