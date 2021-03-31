import {html} from '@erickmerchant/framework'

export const createIndexView = ({layoutView}) => (state) => html`
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="The personal site of Erick Merchant." />
      <link
        rel="preload"
        href="/fonts/public-sans/public-sans-subset.woff2"
        as="font"
        type="font/woff2"
        crossorigin
      />
      <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      <style>
        ${state.styles}
      </style>
      <title>A Web Development Blog</title>
      <script src="/app.js" type="module"></script>
    </head>
    ${layoutView(state)}
  </html>
`
