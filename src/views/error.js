import {html} from '@erickmerchant/framework'

export const createErrorView =
  ({classes}) =>
  (state) => {
    return html`
      <main class=${classes.main}>
        <header class=${classes.header}>
          <h1 class=${classes.heading1}>${state.title ?? ''}</h1>
        </header>
        <p class=${classes.message}>${state.message ?? ''}</p>
      </main>
    `
  }
