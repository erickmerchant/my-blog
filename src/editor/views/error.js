import {html} from '@erickmerchant/framework/main.js'
import {errorClasses} from '../css/styles.js'

export const createErrorView = () => (state) => html`
  <div class=${errorClasses.errorContainer}>
    <h1 class=${errorClasses.headerHeading}>${state.error.message}</h1>
    <pre class=${errorClasses.stackTrace}>${state.error.stack}</pre>
  </div>
`
