import {html} from '@erickmerchant/framework/main.js'
import {errorClasses} from '../css/styles.js'

export const createErrorComponent = () => (state) => html`
  <div>
    <h1 class=${errorClasses.headerHeading}>${state.error.message}</h1>
    <pre class=${errorClasses.stackTrace}>${state.error.stack}</pre>
  </div>
`
