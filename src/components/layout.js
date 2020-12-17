import {html} from '@erickmerchant/framework/main.js'

export const createLayoutComponent = ({
  classes,
  aboutComponent,
  mainComponent,
  anchorAttrs
}) => (state) => html`
  <body class=${classes.app}>
    <div class=${classes.hero}>
      <header class=${classes.header}>
        <a ${anchorAttrs('/')} class=${classes.headerAnchor}>
          ErickMerchant.com
        </a>
      </header>
      ${state.route !== '' ? aboutComponent(state) : null}
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
                ${`© ${new Date().getFullYear()} Erick Merchant`}
              </li>
            </ul>
          </footer>
        `
      : null}
  </body>
`
