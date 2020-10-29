import {html} from '@erickmerchant/framework/main.js'

const yearsSince = (year, month) => {
  const thenAsFloat = year + (month + 1) / 12

  const now = new Date()

  const nowAsFloat = now.getFullYear() + (now.getMonth() + 1) / 12

  return Math.floor(nowAsFloat - thenAsFloat)
}

const aboutContent = `
# About me

I'm *Erick Merchant*. I've been employed as a web developer for *${yearsSince(
  2006,
  6
)}* years. This is my web development blog. Check out my [open-source projects](https://github.com/erickmerchant) on Github.
`

export const createComponent = ({
  classes,
  contentComponent,
  mainComponent,
  anchorAttrs
}) => {
  return (state) => html`
    <body class=${classes.app}>
      <div class=${classes.hero}>
        <div class=${classes.heroInner}>
          <header class=${classes.header}>
            <a ${anchorAttrs('/')} class=${classes.headerAnchor}>
              ErickMerchant.com
            </a>
          </header>
          <aside class=${classes.aboutContent}>
            <div class=${classes.aboutContentInner}>
              ${contentComponent(aboutContent, {
                heading: (text) =>
                  html`
                    <h3 class=${classes.aboutHeading}>${text}</h3>
                  `,
                link: (text, href) =>
                  html`
                    <a class=${classes.aboutAnchor} href=${href}>${text}</a>
                  `,
                paragraph: (items) =>
                  items.length
                    ? html`
                        <p class=${classes.aboutParagraph}>${items}</p>
                      `
                    : null,
                bold: (text) =>
                  html`
                    <strong class=${classes.aboutStrong}>${text}</strong>
                  `
              })}
            </div>
          </aside>
        </div>
      </div>
      ${mainComponent(state)}
      ${state.route !== ''
        ? html`
            <footer class=${classes.footer}>
              <ul class=${classes.footerList}>
                <li class=${classes.footerItem}>
                  <a
                    class=${classes.footerAnchor}
                    href="https://github.com/erickmerchant/my-blog"
                  >
                    View Source
                  </a>
                </li>
                <li class=${classes.footerItem}>
                  © ${new Date().getFullYear()} Erick Merchant
                </li>
              </ul>
            </footer>
          `
        : null}
    </body>
  `
}
