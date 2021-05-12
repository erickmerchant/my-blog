import {html} from '@erickmerchant/framework'

import {errorClasses} from '../css/index.js'

export const createErrorView = () => (state) =>
  html`
    <div class=${errorClasses.container}>
      <h1 class=${errorClasses.heading}>${state.error.message}</h1>
      <pre class=${errorClasses.stack}>${state.error.stack}</pre>
    </div>
  `
