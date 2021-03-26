import {html} from '@erickmerchant/framework/main.js'

import {errorClasses} from '../css/styles.js'

export const createErrorView = () => (state) => html`
  <div class=${errorClasses.container}>
    <h1 class=${errorClasses.heading}>${state.error.message}</h1>
    <pre class=${errorClasses.stack}>${state.error.stack}</pre>
  </div>
`
