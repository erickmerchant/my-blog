import {html} from '@erickmerchant/framework'

export const createMainView =
  ({classes, postView, errorView}) =>
  (state) => {
    if (state.route == null) {
      return html`
        <main class=${classes.main}></main>
      `
    }

    Promise.resolve().then(() => {
      document.body.style.setProperty('--below-main-display', 'block')
    })

    if (state.route.key === 'post') {
      return postView(state)
    }

    if (state.route.key === 'error') {
      return errorView(state)
    }
  }
