import {html} from '@erickmerchant/framework'

export const createLayoutView =
  ({classes, aboutView, mainView, anchorAttrs}) =>
  (state = {}) =>
    html`
      <body class=${classes.app}>
        <header class=${classes.header}>
          <a ${anchorAttrs('/')} class=${classes.headerAnchor}>
            ErickMerchant.com
          </a>
        </header>
        ${mainView(state)}
        <aside class=${classes.aside}>${aboutView(state)}</aside>
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
        <svg class=${classes.iconDefs}>
          <symbol id="link" viewBox="0 0 100 100">
            <circle
              cx="30"
              cy="70"
              r="22.5"
              stroke-width="15"
              class=${classes.iconShape1}
            />
            <circle
              cx="70"
              cy="30"
              r="22.5"
              stroke-width="15"
              class=${classes.iconShape1}
            />
            <rect
              height="20"
              width="60"
              transform="rotate(-45,50,50)"
              x="20"
              y="40"
              class=${classes.iconShape2}
              stroke-width="3"
            />
          </symbol>
        </svg>
      </body>
    `
