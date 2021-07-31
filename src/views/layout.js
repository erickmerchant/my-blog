import {html} from '@erickmerchant/framework'

export const createLayoutView =
  ({
    classes,
    aboutView,
    mainView,
    preferencesView,
    iconsView,
    getAnchorClick
  }) =>
  (state = {}) =>
    html`
      <body class=${classes.app}>
        <header class=${classes.header}>
          <a
            class=${classes.headerAnchor}
            href="/"
            @click=${getAnchorClick('/')}
          >
            ErickMerchant.com
          </a>
        </header>
        ${mainView(state)}
        <aside class=${classes.aside}>${aboutView(state)}</aside>
        <footer class=${classes.footer}>
          <ul class=${classes.footerList}>
            <li class=${classes.footerItem}>
              ${`© ${new Date().getFullYear()} Erick Merchant`}
            </li>
            <li class=${classes.footerItem}>
              <a
                class=${classes.footerAnchor}
                href="https://github.com/erickmerchant/my-blog"
              >
                View Source
              </a>
            </li>
            <li class=${classes.footerItem}>${preferencesView(state)}</li>
          </ul>
        </footer>
        ${iconsView()}
      </body>
    `
